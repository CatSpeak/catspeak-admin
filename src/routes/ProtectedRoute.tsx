import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasAdminAccess, useAuthStore } from "../stores/authStore";
import ScrollToTop from "../components/common/ScrollToTop";

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

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export const PermissionGuardRoute = ({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactElement;
}) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.roleId === 1) return children;
  if (user.permissions?.includes(permission)) return children;
  return <Navigate to="/" replace />;
};
