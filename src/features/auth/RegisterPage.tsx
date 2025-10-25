import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../../services/store/appStore";

const RegisterPage = () => {
  const register = useAppStore((state) => state.register);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [goalDays, setGoalDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!id || !password || !goalDays) {
      setError("全ての項目を入力してください");
      return;
    }

    setSubmitting(true);
    try {
      const success = await register({ id, password, goalDays });
      if (!success) {
        setError("登録に失敗しました。再度お試しください。");
        return;
      }
      navigate("/", { replace: true });
    } catch (error_) {
      console.error(error_);
      
      // Supabase設定エラーの場合
      if (error_ instanceof Error && error_.message.includes("データベースが設定されていません")) {
        setError("システムエラー: データベースが設定されていません。管理者にお問い合わせください。");
      } else {
        setError("登録処理でエラーが発生しました。");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-slate-100 px-6">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-3xl bg-white/90 shadow-2xl px-8 py-10 backdrop-blur"
      >
        <h1 className="text-2xl font-semibold text-slate-900">新規登録</h1>
        <p className="mt-2 text-sm text-slate-500">
          固定の目標日数を設定し、食材習慣の冒険を始めましょう。
        </p>

        <div className="mt-8 space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            ユーザーID
            <input
              value={id}
              onChange={(event) => setId(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="例: dragon_master"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            パスワード
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="任意のパスワード"
              type="password"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-700">
            目標日数
            <input
              value={goalDays}
              onChange={(event) => setGoalDays(Number(event.target.value))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              type="number"
              min={7}
              max={365}
              required
            />
            <span className="text-xs text-slate-500">登録後は変更できません。慎重に設定してください。</span>
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white py-3 text-sm font-semibold shadow-lg hover:bg-emerald-600 disabled:opacity-60"
        >
          {submitting ? "登録中..." : "登録する"}
        </button>

        <p className="mt-6 text-center text-xs text-slate-500">
          すでにアカウントをお持ちですか？ <Link to="/login" className="text-emerald-500 underline">ログインはこちら</Link>
        </p>
      </motion.form>
    </div>
  );
};

export default RegisterPage;
