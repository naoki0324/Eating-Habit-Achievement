import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useAppStore } from "../../services/store/appStore";

const hashPassword = async (password: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const AuthGate = () => {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const [loginId, setLoginId] = useState("dragon_master");
  const [password, setPassword] = useState("demo-password");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginId || !password) {
      setError("IDとパスワードを入力してください");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const digest = await hashPassword(password);
      setUser({ id: loginId, passwordDigest: digest });
    } catch (error_) {
      console.error(error_);
      setError("サインインに失敗しました。ブラウザの設定を確認してください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white max-w-md w-full mx-4 rounded-3xl shadow-2xl border border-slate-200 p-8 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
            <Lock className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">ログインが必要です</h1>
            <p className="text-sm text-slate-500">デモ用の任意IDとパスワードでサインインできます。</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            ユーザーID
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="例: dragon_master"
              autoFocus
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
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white py-3 text-sm font-semibold shadow-lg hover:bg-emerald-600 disabled:opacity-60"
        >
          {submitting ? "サインイン中..." : "サインイン"}
        </button>
      </motion.form>
    </div>
  );
};
