import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "../components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import { ComingSoonPage } from "./ComingSoonPage";
import PageLoader from "./PageLoader";
import RouteErrorElement from "./RouteErrorElement";

const Login = lazy(() => import("../features/auth/routes/Login"));
const ForgotPassword = lazy(() => import("../features/auth/routes/ForgotPassword"));
const Dashboard = lazy(() => import("../features/dashboard/routes/Dashboard"));
const UsersPage = lazy(() => import("../features/users/routes/UsersPage"));
const UserDetailPage = lazy(() => import("../features/users/routes/UserDetailPage"));
const StaffsPage = lazy(() => import("../features/staffs/routes/StaffsPage"));
const StaffDetailPage = lazy(() => import("../features/staffs/routes/StaffDetailPage"));
const HandleReportsPage = lazy(() => import("../features/reports/routes/HandleReportsPage"));
const LiveChatPage = lazy(() => import("../features/chat/routes/LiveChatPage"));
const NewsPage = lazy(() => import("../features/news/routes/NewsPage"));
const CalendarPage = lazy(() => import("../features/calendar/routes/CalendarPage"));
const RoomPage = lazy(() => import("../features/room/routes/RoomPage"));
const PostCreatePage = lazy(() => import("../features/news/routes/PostCreatePage"));
const PostDetailPage = lazy(() => import("../features/news/routes/PostDetailPage"));
const InstructorApplicationsPage = lazy(() => import("../features/instructor-applications/routes/InstructorApplicationsPage"));
const InstructorApplicationDetailPage = lazy(() => import("../features/instructor-applications/routes/InstructorApplicationDetailPage"));
const ReelsPage = lazy(() => import("../features/reels/routes/ReelsPage"));

const wrap = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const secondaryRoutes = [
  { path: "settings", title: "Settings - Coming Soon" },
] as const;

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    errorElement: <RouteErrorElement />,
    children: [
      { path: "/login", element: wrap(Login) },
      { path: "/forgot-password", element: wrap(ForgotPassword) },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <RouteErrorElement />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        errorElement: <RouteErrorElement />,
        children: [
          { index: true, element: wrap(Dashboard) },
          { path: "users", element: wrap(UsersPage) },
          { path: "users/:id", element: wrap(UserDetailPage) },
          { path: "staffs", element: wrap(StaffsPage) },
          { path: "staffs/:id", element: wrap(StaffDetailPage) },
          { path: "reports", element: wrap(HandleReportsPage) },
          { path: "live-chat", element: wrap(LiveChatPage) },
          { path: "news", element: wrap(NewsPage) },
          { path: "calendar", element: wrap(CalendarPage) },
          { path: "room", element: wrap(RoomPage) },
          { path: "news/create", element: wrap(PostCreatePage) },
          { path: "news/:id", element: wrap(PostDetailPage) },
          { path: "instructor-applications", element: wrap(InstructorApplicationsPage) },
          { path: "instructor-applications/:id", element: wrap(InstructorApplicationDetailPage) },
          { path: "reels", element: wrap(ReelsPage) },
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
