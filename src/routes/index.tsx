import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppLayout from "../components/layout/AppLayout";
import { ProtectedRoute, PermissionGuardRoute } from "./ProtectedRoute";
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
const BugReportsPage = lazy(() => import("../features/reports/routes/BugReportsPage"));
const PaymentReportsPage = lazy(() => import("../features/reports/routes/PaymentReportsPage"));
const RefundsPage = lazy(() => import("../features/refunds/routes/RefundsPage"));
const LiveChatPage = lazy(() => import("../features/chat/routes/LiveChatPage"));
const NewsPage = lazy(() => import("../features/news/routes/NewsPage"));
const CalendarPage = lazy(() => import("../features/calendar/routes/CalendarPage"));
const RoomPage = lazy(() => import("../features/room/routes/RoomPage"));
const ClassesPage = lazy(() => import("../features/classes/routes/ClassesPage"));
const PostCreatePage = lazy(() => import("../features/news/routes/PostCreatePage"));
const PostDetailPage = lazy(() => import("../features/news/routes/PostDetailPage"));
const InstructorApplicationsPage = lazy(() => import("../features/instructor-applications/routes/InstructorApplicationsPage"));
const InstructorApplicationDetailPage = lazy(() => import("../features/instructor-applications/routes/InstructorApplicationDetailPage"));
const ReelsPage = lazy(() => import("../features/reels/routes/ReelsPage"));
const AnalyticsPage = lazy(() => import("../features/analytics/routes/AnalyticsPage"));
const PlansPage = lazy(() => import("../features/plans/PlansPage"));
const PlanDetailsPage = lazy(() => import("../features/plans/routes/PlanDetailsPage"));
const VoucherPage = lazy(() => import("../features/voucher/routes/VoucherPage"));
const VoucherCreatePage = lazy(() => import("../features/voucher/routes/VoucherCreatePage"));
const VoucherDetailPage = lazy(() => import("../features/voucher/routes/VoucherDetailPage"));
const BroadcastMailPage = lazy(() => import("../features/broadcast/routes/BroadcastMailPage"));

const wrap = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const guard = (Component: React.ComponentType, perm: string) => (
  <PermissionGuardRoute permission={perm}>
    {wrap(Component)}
  </PermissionGuardRoute>
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
          { path: "users", element: guard(UsersPage, "users") },
          { path: "users/:id", element: guard(UserDetailPage, "users") },
          { path: "staffs", element: guard(StaffsPage, "staffs") },
          { path: "staffs/:id", element: guard(StaffDetailPage, "staffs") },
          { path: "reports", element: guard(HandleReportsPage, "letter_reports") },
          { path: "bug-reports", element: guard(BugReportsPage, "bug_reports") },
          { path: "payments", element: guard(PaymentReportsPage, "payment_reports") },
          { path: "refunds", element: guard(RefundsPage, "payment_reports") },
          { path: "live-chat", element: wrap(LiveChatPage) },
          { path: "news", element: guard(NewsPage, "news") },
          { path: "calendar", element: guard(CalendarPage, "calendar") },
          { path: "room", element: guard(RoomPage, "room") },
          { path: "classes", element: guard(ClassesPage, "classes") },
          { path: "analytics", element: guard(AnalyticsPage, "reports") },
          { path: "plans", element: guard(PlansPage, "plans") },
          { path: "plans/create", element: guard(PlanDetailsPage, "plans") },
          { path: "plans/:id", element: guard(PlanDetailsPage, "plans") },
          { path: "vouchers", element: guard(VoucherPage, "vouchers") },
          { path: "vouchers/create", element: guard(VoucherCreatePage, "vouchers") },
          { path: "voucher/create", element: guard(VoucherCreatePage, "vouchers") },
          { path: "vouchers/:id/edit", element: guard(VoucherCreatePage, "vouchers") },
          { path: "voucher/:id/edit", element: guard(VoucherCreatePage, "vouchers") },
          { path: "vouchers/:id", element: guard(VoucherDetailPage, "vouchers") },
          { path: "voucher/:id", element: guard(VoucherDetailPage, "vouchers") },
          { path: "news/create", element: guard(PostCreatePage, "news") },
          { path: "news/:slug", element: guard(PostDetailPage, "news") },
          { path: "instructor-applications", element: guard(InstructorApplicationsPage, "instructor_applications") },
          { path: "instructor-applications/:id", element: guard(InstructorApplicationDetailPage, "instructor_applications") },
          { path: "reels", element: guard(ReelsPage, "reels") },
          { path: "broadcast-mail", element: guard(BroadcastMailPage, "broadcast_mail") },
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
