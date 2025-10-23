# ストック管理ドラゴン計画 - 開発ガイド

このプロジェクトは React 18・TypeScript・Vite・Tailwind CSS を使用した食材継続チェック用アプリです。継続によってドラゴンが進化する体験をトップ画面で見せ、右下の FAB から日次チェックリストを登録・確認できます。現在は Supabase をバックエンドに採用したフルスタック構成です。

## 開発に必要なコマンド
- **依存インストール**: `npm install`
- **本番ビルド**: `npm run build`
- Lint/Test は未導入。必要であれば追加してください。

## アプリケーション構成の概要
- **ルーティング**: `src/App.tsx` で `react-router-dom` を利用。`/login`, `/register`, `/`, `/options` の4ページ構成。
- **グローバル状態**: `src/store/appStore.ts` の Zustand ストアに集約。ユーザー情報、テンプレート、日次記録、ログ、モーダル状態を管理し、Supabase API と連携します。
- **API レイヤー**: `src/api/` 配下にドメイン別モジュール（`user.ts`, `template.ts`, `dailyChecklist.ts`, `logger.ts` 等）。`supabaseClient.ts` でクライアント生成。`src/types/domain.ts` に共有ドメイン型、`src/api/types.ts` にテーブル行型を定義。
- **ページ**:
  - `LoginPage.tsx`: サインインフォーム（サインアップ導線付き）。
  - `RegisterPage.tsx`: 新規登録フォーム。ユーザーID・パスワード・目標日数を登録し、テンプレート初期化まで実行。
  - `HomePage.tsx`: 進捗サマリー（TopHero + DragonEvolution）。シンプルな 3 カード導線で「今日のチェック」「テンプレ設定」「ログ確認」へ誘導。
  - `OptionsPage.tsx`: テンプレート編集とログ確認をセクション化して配置。
- **主要コンポーネント**: `src/components/` にヒーロー、ドラゴン表示、テンプレ編集モーダル、ログパネルなどを配置。
- **スタイル**: `src/styles/index.css` と Tailwind ユーティリティを併用。柔らかいニュートラル/エメラルド系カラーが基本。

## Supabase バックエンド
- **クライアント設定**: `src/api/supabaseClient.ts`。`.env` で `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` を設定。
- **テーブル定義**: `supabase/schema.sql`
  - `auth_users` … ユーザーID・パスワードハッシュ・目標日数・作成日時
  - `checklist_templates` / `checklist_template_items` … テンプレセクション・項目（ユーザー単位で並び順管理）
  - `daily_checklists` … 日付×ユーザーのチェックリスト進捗 JSON を保存（ユニーク制約あり）
  - `system_logs` … 操作ログ（ユーザーIDはnull許容）
  - 各種 index を付与済み
- **登録フロー**: `registerUser` で SHA-256 ハッシュ化 → `auth_users` 挿入 → テンプレート初期化。ログイン時は `authenticateUser` で照合。

## デザイン・UX 原則
- 柔らかいニュートラルカラーとエメラルド系を基調にしたプレミアムな雰囲気。
- 余白・タイポグラフィを重視した非対称レイアウト。
- 適度なモーション演出（Framer Motion）とホバーのマイクロインタラクション。
- スクロール/閲覧導線はホーム → カード導線 → オプションセクションで整理。

## 注意点
- ビルドは必ず `npm run build` で検証すること。開発用コマンドは提供しない。
- 静的アセット参照は `/assets/` などの絶対パスを使用（Vite ビルド後に解決されます）。
- `index.html` の `<script type="module" src="/src/main.tsx"></script>` は変更不可。
- Supabase のスキーマ更新時は `supabase/schema.sql` を忘れず更新し、手動実行時には適用履歴を `sql_logs/` などに残すことを推奨。
