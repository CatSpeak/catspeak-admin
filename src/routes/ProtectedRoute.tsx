import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasAdminAccess, useAuthStore } from "../stores/authStore";

export const ProtectedRoute = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const canAccessAdmin = isAuthenticated && hasAdminAccess(user);

  useEffect(() => {
    if (isAuthenticated && !canAccessAdmin) {
      logout();
    }
  }, [canAccessAdmin, isAuthenticated, logout]);

  if (isAuthenticated && !canAccessAdmin) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
