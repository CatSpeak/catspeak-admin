import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import ScrollToTop from "../components/common/ScrollToTop";

export const PublicRoute = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};
