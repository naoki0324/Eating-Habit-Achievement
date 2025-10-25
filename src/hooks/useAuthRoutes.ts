import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import { useAppStore } from "../store/appStore";
import { Navigate } from "react-router-dom";

export const useAuthRoutes = () => {
  const user = useAppStore((state) => state.user);

  const renderAuthRoutes = () => [
    { path: "/login", element: user ? <Navigate to="/" replace /> : <LoginPage /> },
    { path: "/register", element: user ? <Navigate to="/" replace /> : <RegisterPage /> },
  ];

  const requireAuth = (element: JSX.Element) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return element;
  };

  return { renderAuthRoutes, requireAuth };
};
