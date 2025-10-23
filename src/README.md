# ストック管理ドラゴン計画 - リファクタリング後の構造

このプロジェクトは機能別に整理されたReactアプリケーションです。

## 📁 新しいディレクトリ構造

```
src/
├── features/           # 機能別モジュール
│   ├── auth/          # 認証機能
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── AuthGate.tsx
│   │   └── index.ts
│   ├── checklist/     # チェックリスト機能
│   │   ├── ChecklistFAB.tsx
│   │   ├── ChecklistModal.tsx
│   │   ├── ChecklistTemplateEditor.tsx
│   │   ├── OptionsPage.tsx
│   │   └── index.ts
│   ├── dragon/        # ドラゴン進化機能
│   │   ├── DragonEvolution.tsx
│   │   └── index.ts
│   └── home/          # ホーム機能
│       ├── HomePage.tsx
│       ├── TopHero.tsx
│       └── index.ts
├── lib/               # ライブラリ・インフラ層
│   ├── api/          # API関連
│   │   ├── dailyChecklist.ts
│   │   ├── logger.ts
│   │   ├── supabaseClient.ts
│   │   ├── template.ts
│   │   ├── types.ts
│   │   └── user.ts
│   └── store/        # 状態管理
│       └── appStore.ts
├── shared/           # 共通リソース
│   ├── assets/       # 静的アセット
│   ├── components/   # 共通コンポーネント
│   ├── constants/    # 定数
│   ├── hooks/        # 共通フック
│   ├── styles/       # スタイル
│   ├── types/        # 型定義
│   └── utils/        # ユーティリティ
├── App.tsx           # メインアプリケーション
└── main.tsx          # エントリーポイント
```

## 🎯 設計原則

### Feature-Based Architecture
- 各機能を独立したモジュールとして分離
- 機能間の依存関係を最小化
- スケーラブルな構造

### Separation of Concerns
- **Features**: UI・ビジネスロジック
- **Lib**: インフラ層（API・状態管理）
- **Shared**: 共通リソース

### Clean Imports
- 各機能は相対パスでインポート
- 共通リソースは絶対パスでインポート
- 循環依存を回避

## 🚀 利点

1. **保守性向上**: 機能別に整理されたため、変更の影響範囲が明確
2. **再利用性**: 共通コンポーネントとユーティリティの分離
3. **スケーラビリティ**: 新機能の追加が容易
4. **可読性**: ファイルの目的と場所が明確
5. **チーム開発**: 機能別の並行開発が可能

