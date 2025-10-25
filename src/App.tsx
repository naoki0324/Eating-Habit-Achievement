import { ReactNode, useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import HomePage from "./features/home/HomePage";
import OptionsPage from "./features/checklist/OptionsPage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import { ChecklistModal } from "./features/checklist";
import { useAppStore } from "./services/store/appStore";
import "./styles/index.css";

const layoutBackground = "linear-gradient(135deg, #f6f4f1 0%, #f0f7f4 50%, #ffffff 100%)";

const AppShell = ({ children }: { children: ReactNode }) => {
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const modalOpen = useAppStore((state) => state.modalOpen);
  const setModalOpen = useAppStore((state) => state.setModalOpen);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleOpenChecklist = () => {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDate(today);
    setModalOpen(true);
  };

  // 現在のページ状態を判定
  const isHome = location.pathname === "/";
  const isOptionsTemplate = location.pathname === "/options" && location.hash === "#template";
  const isChecklistOpen = modalOpen;


  return (
    <main
      className="min-h-screen w-full bg-cover bg-fixed"
      style={{ backgroundImage: layoutBackground }}
    >
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_55%)]" />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-4 lg:py-6">
          <header className="mb-6 flex flex-col gap-4 rounded-3xl bg-white/70 px-6 py-4 shadow-xl backdrop-blur md:flex-row md:items-center md:justify-between">
            <Link 
              to="/" 
              className={`rounded-full border px-4 py-2 text-sm transition ${
                isHome
                  ? "border-emerald-500 bg-emerald-500 text-white shadow"
                  : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white"
              }`}
            >
              Home
            </Link>
            <div className="flex items-center gap-3">
              {user && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                  {user.id}
                </span>
              )}
              <button
                onClick={handleOpenChecklist}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isChecklistOpen
                    ? "border-emerald-500 bg-emerald-500 text-white shadow"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white"
                }`}
              >
                今日のチェックリスト
              </button>
              <Link
                to="/options#template"
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isOptionsTemplate
                    ? "border-emerald-500 bg-emerald-500 text-white shadow"
                    : "border-slate-200 bg-white/80 text-slate-600 hover:bg-white"
                }`}
              >
                テンプレート設定
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                ログアウト
              </button>
            </div>
          </header>
          {children}
          <ChecklistModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
      </div>
    </main>
  );
};

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const user = useAppStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RedirectIfAuthenticated = ({ children }: { children: JSX.Element }) => {
  const user = useAppStore((state) => state.user);
  if (user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const user = useAppStore((state) => state.user);
  const bootstrap = useAppStore((state) => state.bootstrap);

  useEffect(() => {
    if (user) {
      bootstrap();
    }
  }, [user, bootstrap]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthenticated>
            <LoginPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfAuthenticated>
            <RegisterPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppShell>
              <HomePage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/options"
        element={
          <RequireAuth>
            <AppShell>
              <OptionsPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
