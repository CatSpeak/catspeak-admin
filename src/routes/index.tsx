// import { createBrowserRouter, Navigate } from "react-router-dom";
// import AppLayout from "../components/layout/AppLayout";
// import UsersPage from "../features/users/routes/UsersPage";
// import Dashboard from "../features/dashboard/routes/Dashboard";
// import { ProtectedRoute } from "./ProtectedRoute";
// import { ComingSoonPage } from "./ComingSoonPage";
// import Login from "../features/auth/routes/Login";
// import UserDetailPage from "../features/users/routes/UserDetailPage";
// import HandleReportsPage from "../features/reports/routes/HandleReportsPage";
// import LiveChatPage from "../features/chat/routes/LiveChatPage";
// import NewsPage from "../features/news/routes/NewsPage";

// const secondaryRoutes = [
//   {
//     path: "settings",
//     title: "Settings - Comming Soon",
//   },
//   {
//     path: "staff",
//     title: "Staff Management - Coming Soon",
//   },
// ] as const;

// export const router = createBrowserRouter([
//   {
//     path: "/login",
//     element: <Login />,
//   },
//   {
//     path: "/",
//     element: <ProtectedRoute />,
//     children: [
//       {
//         path: "/",
//         element: <AppLayout />,
//         children: [
//           {
//             index: true,
//             element: <Dashboard />,
//           },
//           {
//             path: "users",
//             element: <UsersPage />,
//           },
//           {
//             path: "users/:id",
//             element: <UserDetailPage />,
//           },
//           {
//             path: "reports",
//             element: <HandleReportsPage />,
//           },
//           {
//             path: "live-chat",
//             element: <LiveChatPage />,
//           },
//           {
//             path: "news",
//             element: <NewsPage />,
//           },
//           ...secondaryRoutes.map((route) => ({
//             path: route.path,
//             element: <ComingSoonPage title={route.title} />,
//           })),
//         ],
//       },
//     ],
//   },
//   {
//     path: "*",
//     element: <Navigate to="/" replace />,
//   },
// ]);

import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { ComingSoonPage } from "./ComingSoonPage";

// Lazy imports — each page becomes its own JS chunk
const Login = lazy(() => import("../features/auth/routes/Login"));
const Dashboard = lazy(() => import("../features/dashboard/routes/Dashboard"));
const UsersPage = lazy(() => import("../features/users/routes/UsersPage"));
const UserDetailPage = lazy(() => import("../features/users/routes/UserDetailPage"));
const HandleReportsPage = lazy(() => import("../features/reports/routes/HandleReportsPage"));
const LiveChatPage = lazy(() => import("../features/chat/routes/LiveChatPage"));
const NewsPage = lazy(() => import("../features/news/routes/NewsPage"));

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
  { path: "/login", element: wrap(Login) },
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
