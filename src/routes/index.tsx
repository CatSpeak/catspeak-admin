import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import UsersPage from "../features/users/UsersPage";
import Dashboard from "../features/dashboard/Dashboard";
import { ProtectedRoute } from "./ProtectedRoute";
import { ComingSoonPage } from "./ComingSoonPage";
import Login from "../features/auth/routes/Login";
import UserDetailPage from "../features/users/UserDetailPage";

const secondaryRoutes = [
  {
    path: "settings",
    title: "Settings - Comming Soon",
  },
  {
    path: "live-chat",
    title: "Live Chat Support - Coming Soon",
  },
  {
    path: "reports",
    title: "Handle Reports - Coming Soon",
  },
  {
    path: "staff",
    title: "Staff Management - Coming Soon",
  },
] as const;

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "users/:id",
            element: <UserDetailPage />,
          },
          ...secondaryRoutes.map((route) => ({
            path: route.path,
            element: <ComingSoonPage title={route.title} />,
          })),
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
