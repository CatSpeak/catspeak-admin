import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { ComingSoonPage } from "./ComingSoonPage";

// Lazy imports — each page becomes its own JS chunk
const Login = lazy(() => import("../features/auth/routes/Login"));
const Dashboard = lazy(() => import("../features/dashboard/routes/Dashboard"));
const UsersPage = lazy(() => import("../features/users/routes/UsersPage"));
const UserDetailPage = lazy(() => import("../features/users/routes/UserDetailPage"));
const HandleReportsPage = lazy(() => import("../features/reports/routes/HandleReportsPage"));
const LiveChatPage = lazy(() => import("../features/chat/routes/LiveChatPage"));
const NewsPage = lazy(() => import("../features/news/routes/NewsPage"));
const PostCreatePage = lazy(() => import("../features/news/routes/PostCreatePage"));
const PostDetailPage = lazy(() => import("../features/news/routes/PostDetailPage"));

// A shared fallback spinner
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }}
  >
    <span>Loading...</span>
  </div>
);

const wrap = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const secondaryRoutes = [
  { path: "settings", title: "Settings - Coming Soon" },
  { path: "staff", title: "Staff Management - Coming Soon" },
] as const;

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: "/login", element: wrap(Login) },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: wrap(Dashboard) },
          { path: "users", element: wrap(UsersPage) },
          { path: "users/:id", element: wrap(UserDetailPage) },
          { path: "reports", element: wrap(HandleReportsPage) },
          { path: "live-chat", element: wrap(LiveChatPage) },
          { path: "news", element: wrap(NewsPage) },
          { path: "news/create", element: wrap(PostCreatePage) },
          { path: "news/:id", element: wrap(PostDetailPage) },
          ...secondaryRoutes.map((route) => ({
            path: route.path,
            element: <ComingSoonPage title={route.title} />,
          })),
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
