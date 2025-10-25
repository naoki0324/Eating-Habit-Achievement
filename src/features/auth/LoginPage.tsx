import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../../services/store/appStore";
import { motion } from "framer-motion";
import { ErrorPopup } from "../../components/ui/ErrorPopup";

const LoginPage = () => {
  const login = useAppStore((state) => state.login);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorType, setErrorType] = useState<"invalid_credentials" | "network_error" | "validation_error">("validation_error");
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setShowErrorPopup(false);

    if (!loginId || !password) {
      setError("IDとパスワードを入力してください");
      setErrorType("validation_error");
      return;
    }

    setSubmitting(true);
    try {
      const success = await login(loginId, password);
      
      if (!success) {
        // 認証失敗の場合、詳細なエラーポップアップを表示
        setErrorType("invalid_credentials");
        setShowErrorPopup(true);
        return;
      }

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      
      // Supabase設定エラーの場合
      if (error instanceof Error && error.message.includes("データベースが設定されていません")) {
        setErrorType("network_error");
        setShowErrorPopup(true);
      } else {
        setErrorType("network_error");
        setShowErrorPopup(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterClick = () => {
    setShowErrorPopup(false);
    navigate("/register", { replace: true });
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case "invalid_credentials":
        return {
          title: "ログインに失敗しました",
          message: "入力されたIDまたはパスワードが正しくありません。\n\nもしくは、まだアカウントが登録されていない可能性があります。",
          showRegisterPrompt: true,
        };
      case "network_error":
        return {
          title: "システムエラーが発生しました",
          message: "データベース接続に問題があります。\n\n管理者にお問い合わせいただくか、しばらく時間をおいてから再度お試しください。",
          showRegisterPrompt: false,
        };
      default:
        return {
          title: "入力エラー",
          message: "入力内容を確認してください。",
          showRegisterPrompt: false,
        };
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
        <h1 className="text-2xl font-semibold text-slate-900">ログイン</h1>
        <p className="mt-2 text-sm text-slate-500">
          登録済みのIDとパスワードでサインインしてください。
        </p>

        <div className="mt-8 space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            ユーザーID
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
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
        </div>

        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white py-3 text-sm font-semibold shadow-lg hover:bg-emerald-600 disabled:opacity-60"
        >
          {submitting ? "サインイン中..." : "サインイン"}
        </button>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>新しく始める方はこちらから登録してください。</p>
          <Link
            to="/register"
            className="mt-3 inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-2 text-sm font-semibold text-emerald-500 transition hover:bg-emerald-50"
          >
            新規登録へ進む
          </Link>
        </div>
      </motion.form>

      {/* エラーポップアップ */}
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={() => setShowErrorPopup(false)}
        title={getErrorMessage().title}
        message={getErrorMessage().message}
        showRegisterPrompt={getErrorMessage().showRegisterPrompt}
        onRegisterClick={handleRegisterClick}
      />
    </div>
  );
};

export default LoginPage;
