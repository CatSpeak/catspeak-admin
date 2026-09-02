import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useUserDetail } from "../hooks/useUserDetail";
import { useUserPayments } from "../hooks/useUserPayments";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  BookOpen,
  Award,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  AlertTriangle,
  Package,
} from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";
import { getActivePlans } from "../../plans/api/getActivePlans";
import { upgradeSubscription } from "../api/upgradeSubscription";
import { getApiErrorMessage } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";
import { formatDateTime } from "../../../lib/utils";

import { useAuthStore } from "../../../stores/authStore";
import { promoteUserToStaff } from "../../staffs/api/permissions";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { UserPlus, LockOpen, ShieldCheck, ChevronDown } from "lucide-react";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import { unlockUser } from "../api/unlockUser";
import { activateUser } from "../api/activateUser";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading, error, refetch } = useUserDetail(id);
  const {
    payments,
    loading: paymentsLoading,
    error: paymentsError,
  } = useUserPayments(id);
  const { t } = useLanguage();
  const currentUser = useAuthStore((state) => state.user);
  const isPrimaryAdmin = currentUser?.roleId === 1;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [upgradingPlanId, setUpgradingPlanId] = useState<number | null>(null);
  const [upgradeMessage, setUpgradeMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [promoting, setPromoting] = useState(false);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [promoteMsg, setPromoteMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [activating, setActivating] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [showActivateConfirm, setShowActivateConfirm] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");
  const [activateReason, setActivateReason] = useState("");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const executePromoteToStaff = async () => {
    if (!user || !isPrimaryAdmin) return;
    try {
      setPromoting(true);
      setPromoteMsg(null);
      await promoteUserToStaff(user.accountId);
      setPromoteMsg({ type: "success", text: `Đã thăng cấp người dùng '${user.username}' thành Staff!` });
      if (refetch) await refetch();
      setTimeout(() => navigate(`/staffs/${user.accountId}`), 1200);
    } catch (err) {
      setPromoteMsg({ type: "error", text: getApiErrorMessage(err, "Không thể thăng cấp người dùng thành Staff.") });
    } finally {
      setPromoting(false);
    }
  };

  const executeUnlock = async () => {
    if (!user) return;
    try {
      setUnlocking(true);
      setActionMsg(null);
      const res = await unlockUser(user.accountId, unlockReason || undefined);
      setActionMsg({ type: "success", text: res.message });
      setUnlockReason("");
      setShowUnlockConfirm(false);
      if (refetch) await refetch();
    } catch (err) {
      setActionMsg({ type: "error", text: getApiErrorMessage(err, "Không thể mở khóa tài khoản.") });
    } finally {
      setUnlocking(false);
    }
  };

  const executeActivate = async () => {
    if (!user) return;
    try {
      setActivating(true);
      setActionMsg(null);
      const res = await activateUser(user.accountId, activateReason || undefined);
      setActionMsg({ type: "success", text: res.message });
      setActivateReason("");
      setShowActivateConfirm(false);
      if (refetch) await refetch();
    } catch (err) {
      setActionMsg({ type: "error", text: getApiErrorMessage(err, "Không thể kích hoạt tài khoản.") });
    } finally {
      setActivating(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchPlansList = async () => {
      try {
        setPlansLoading(true);
        setPlansError(null);
        const res = await getActivePlans();
        if (cancelled) return;
        const list = Array.isArray(res)
          ? res
          : (res as { data?: Plan[] })?.data || [];
        setPlans(list);
      } catch (err: unknown) {
        if (cancelled) return;
        setPlansError(getApiErrorMessage(err, "Failed to load plans."));
      } finally {
        if (!cancelled) {
          setPlansLoading(false);
        }
      }
    };

    fetchPlansList();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpgrade = async (planId: number) => {
    const userIdNum = Number(id);
    if (!userIdNum || Number.isNaN(userIdNum)) return;

    setUpgradingPlanId(planId);
    setUpgradeMessage(null);

    try {
      await upgradeSubscription(userIdNum, { subscriptionId: planId });
      setUpgradeMessage({
        type: "success",
        text: t.plans.upgradeSuccess,
      });
      if (refetch) {
        await refetch();
      }
    } catch (err: unknown) {
      setUpgradeMessage({
        type: "error",
        text: getApiErrorMessage(err, t.plans.upgradeFailed),
      });
    } finally {
      setUpgradingPlanId(null);
    }
  };

  // Calculate transaction stats
  const stats = useMemo(() => {
    let totalSpent = 0;
    let successfulCount = 0;
    let cancelledCount = 0;
    let pendingCount = 0;

    payments.forEach((p) => {
      if (p.status === 1) {
        totalSpent += p.amount;
        successfulCount++;
      } else if (p.status === 2) {
        cancelledCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      totalSpent,
      successfulCount,
      cancelledCount,
      pendingCount,
      totalCount: payments.length,
    };
  }, [payments]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header Breadcrumb Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
          <div className="flex items-center justify-between gap-4">
            <div className="h-7 bg-gray-200 rounded animate-pulse w-48" />
            <div className="h-10 bg-gray-200 rounded-xl animate-pulse w-24 shrink-0" />
          </div>
        </div>

        {/* Profile Banner Skeleton */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />
          <div className="flex-1 space-y-3 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <div className="h-7 bg-gray-200 rounded animate-pulse w-48" />
              <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
              <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64 mx-auto md:mx-0" />
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-40" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            </div>
          </div>
        </div>

        {/* Info Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-36 mb-6" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
              >
                <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-36 mb-6" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
              >
                <div className="w-8 h-8 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans Section Skeleton */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-36 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-6 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
                </div>
                <div className="h-8 bg-gray-200 rounded-xl animate-pulse w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* Payment Section Skeleton */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-44" />

          {/* Stats Boxes Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="h-10 bg-gray-100 w-full animate-pulse border-b border-gray-200" />
            <div className="divide-y divide-gray-150 bg-white">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-5 py-4 flex gap-4 items-center">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 text-error-600">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">{error ?? t.users.userNotFound}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Breadcrumb & Action Header */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center text-xs font-semibold tracking-wider text-gray-400">
          <span
            onClick={() => navigate("/users")}
            className="cursor-pointer hover:text-primary transition-colors"
          >
            {t.users.title}
          </span>
          <ChevronRight className="w-3.5 h-3.5 mx-1" />
          <span className="text-gray-600">{t.users.userProfile}</span>
        </nav>

        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {t.users.userDetails}
          </h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsActionsOpen((o) => !o)}
                className="dropdown-toggle inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
              >
                <span>Thao tác</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isActionsOpen ? "rotate-180" : ""}`} />
              </button>
              <Dropdown isOpen={isActionsOpen} onClose={() => setIsActionsOpen(false)} className="absolute right-0 mt-2 w-64 p-1.5">
                {user.isLocked && (
                  <DropdownItem onClick={() => { setIsActionsOpen(false); setShowUnlockConfirm(true); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg">
                    <LockOpen className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold">Mở khóa tài khoản</span>
                    {user.remainingMinutes && <span className="ml-auto text-xs text-amber-600">còn {user.remainingMinutes} phút</span>}
                  </DropdownItem>
                )}
                {user.isPendingActivation && (
                  <DropdownItem onClick={() => { setIsActionsOpen(false); setShowActivateConfirm(true); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold">Kích hoạt thủ công</span>
                  </DropdownItem>
                )}
                {isPrimaryAdmin && user.roleId === 2 && (
                  <DropdownItem onClick={() => { setIsActionsOpen(false); setShowPromoteConfirm(true); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg">
                    <UserPlus className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">Thăng Cấp Thành Staff</span>
                  </DropdownItem>
                )}
                {!user.isLocked && !user.isPendingActivation && !(isPrimaryAdmin && user.roleId === 2) && (
                  <div className="px-3 py-2.5 text-sm text-gray-400 text-center">Không có thao tác khả dụng</div>
                )}
              </Dropdown>
            </div>

            <ConfirmModal
              isOpen={showPromoteConfirm}
              onClose={() => setShowPromoteConfirm(false)}
              onConfirm={() => {
                setShowPromoteConfirm(false);
                executePromoteToStaff();
              }}
              title="Xác nhận thăng cấp người dùng"
              description={
                <span>
                  Bạn có chắc chắn muốn thăng cấp người dùng <strong className="text-gray-900">'{user.username}'</strong> thành <strong>Staff</strong>?
                  <br />
                  Tài khoản này sẽ có quyền truy cập vào hệ thống Admin với các phân quyền cơ bản.
                </span>
              }
              confirmText="Thăng cấp thành Staff"
              variant="primary"
              isLoading={promoting}
            />

            <ConfirmModal
              isOpen={showUnlockConfirm}
              onClose={() => { if (!unlocking) setShowUnlockConfirm(false); }}
              onConfirm={executeUnlock}
              title="Xác nhận mở khóa tài khoản"
              description={
                <span>
                  Bạn có chắc chắn muốn mở khóa tài khoản <strong className="text-gray-900">'{user.username}'</strong> đang bị khóa do đăng nhập sai nhiều lần?
                  <div className="mt-3 text-left">
                    <label className="text-xs font-bold text-gray-600">Lý do (không bắt buộc)</label>
                    <input
                      type="text"
                      value={unlockReason}
                      onChange={(e) => setUnlockReason(e.target.value)}
                      placeholder="Nhập lý do mở khóa..."
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </span>
              }
              confirmText="Mở khóa"
              variant="warning"
              isLoading={unlocking}
            />

            <ConfirmModal
              isOpen={showActivateConfirm}
              onClose={() => { if (!activating) setShowActivateConfirm(false); }}
              onConfirm={executeActivate}
              title="Xác nhận kích hoạt thủ công"
              description={
                <span>
                  Bạn có chắc chắn muốn kích hoạt thủ công tài khoản <strong className="text-gray-900">'{user.username}'</strong> đang chờ xác thực email?
                  <div className="mt-3 text-left">
                    <label className="text-xs font-bold text-gray-600">Lý do (không bắt buộc)</label>
                    <input
                      type="text"
                      value={activateReason}
                      onChange={(e) => setActivateReason(e.target.value)}
                      placeholder="Nhập lý do kích hoạt..."
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </span>
              }
              confirmText="Kích hoạt"
              variant="primary"
              isLoading={activating}
            />

            <button
              onClick={() => navigate("/users")}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold rounded-xl text-white shadow-sm hover:shadow transition-all bg-primary hover:bg-primary-dark shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.common.back}
            </button>
          </div>
        </div>
      </div>

      {promoteMsg && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
            promoteMsg.type === "success"
              ? "bg-success-50 text-success-700 border-success-100"
              : "bg-error-50 text-error-700 border-error-100"
          }`}
        >
          {promoteMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{promoteMsg.text}</span>
        </div>
      )}

      {actionMsg && (
        <div
          className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
            actionMsg.type === "success"
              ? "bg-success-50 text-success-700 border-success-100"
              : "bg-error-50 text-error-700 border-error-100"
          }`}
        >
          {actionMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Profile Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 transition-all hover:shadow-md">
        {/* Avatar Frame with Gradient */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-primary-light text-white text-3xl font-extrabold flex items-center justify-center shrink-0 shadow-inner">
          {user.username ? user.username.substring(0, 2).toUpperCase() : "US"}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {user.username}
            </h2>
            <span className="inline-flex px-2.5 py-0.5 rounded-full border border-primary/20 text-[10px] font-bold text-primary bg-primary/5 capitalize">
              {user.roleName || "User"}
            </span>
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                user.status !== 0
                  ? "bg-success-50 text-success-700 border-success-100"
                  : "bg-error-50 text-error-700 border-error-100"
              }`}
            >
              {user.status !== 0 ? t.common.active : t.users.banned}
            </span>
            {user.isLocked && (
              <span className="inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200">
                Đang bị khóa{user.remainingMinutes ? ` • còn ${user.remainingMinutes} phút` : ""}
              </span>
            )}
            {user.isPendingActivation && (
              <span className="inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold bg-blue-50 text-blue-700 border-blue-200">
                Chờ kích hoạt
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 font-medium flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="w-4 h-4 text-gray-400" />
            {user.email}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {t.users.lastActive}:{" "}
              {user.lastSeen
                ? new Date(user.lastSeen).toLocaleString("en-GB")
                : t.users.never}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t.users.joined}: {formatDateTime(user.createDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Information Section (Side-by-side grids) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
            <User className="w-5 h-5 text-primary" />
            {t.common.personalInformation}
          </h3>
          <div className="space-y-4">
            <DetailItem
              icon={<Clock className="w-4 h-4" />}
              label={t.users.accountId}
              value={`#${user.accountId}`}
            />
            <DetailItem
              icon={<Mail className="w-4 h-4" />}
              label={t.users.email}
              value={user.email}
              copyable
            />
            <DetailItem
              icon={<Phone className="w-4 h-4" />}
              label={t.users.phone}
              value={user.phoneNumber || t.common.notRegistered}
            />
            <DetailItem
              icon={<Calendar className="w-4 h-4" />}
              label={t.common.createdDate}
              value={formatDateTime(user.createDate)}
            />
          </div>
        </div>

        {/* Learning Settings Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
            <BookOpen className="w-5 h-5 text-primary" />
            {t.common.learningSettings}
          </h3>
          <div className="space-y-4">
            <DetailItem
              icon={<Globe className="w-4 h-4" />}
              label={t.users.nativeLanguage}
              value={user.naturalLanguage || t.common.notSpecified}
            />
            <DetailItem
              icon={<BookOpen className="w-4 h-4" />}
              label={t.users.learningLanguage}
              value={user.languageLearning || t.common.notSpecified}
            />
            <DetailItem
              icon={<Award className="w-4 h-4" />}
              label={t.users.level}
              value={user.proficiency || t.common.notSpecified}
            />
            <DetailItem
              icon={<Globe className="w-4 h-4" />}
              label={t.users.country}
              value={user.country || "Vietnam"}
            />
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
          <Package className="w-5 h-5 text-primary" />
          {t.plans.title}
        </h3>

        {upgradeMessage && (
          <div
            className={`mb-4 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-2 ${
              upgradeMessage.type === "success"
                ? "bg-success-50 text-success-700 border-success-100"
                : "bg-error-50 text-error-700 border-error-100"
            }`}
          >
            {upgradeMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{upgradeMessage.text}</span>
          </div>
        )}

        {plansLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-500 font-semibold">
            <svg
              className="animate-spin h-5 w-5 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{t.plans.loadingPlans}</span>
          </div>
        ) : plansError ? (
          <div className="py-6 text-center text-sm font-semibold text-error-600">
            {plansError}
          </div>
        ) : plans.length === 0 ? (
          <div className="py-6 text-center text-sm font-medium text-gray-500">
            {t.plans.noPlansFound}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plans.map((plan) => {
              const isSubscribed = Boolean(
                user &&
                ((user.currentSubscriptionId != null &&
                  user.currentSubscriptionId === plan.planId) ||
                  (user.currentSubscriptionName &&
                    plan.planName &&
                    user.currentSubscriptionName.trim().toLowerCase() ===
                      plan.planName.trim().toLowerCase())),
              );

              return (
                <div
                  key={plan.planId}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isSubscribed
                      ? "border-success-300 bg-success-50/60 text-success-900"
                      : "border-gray-150 bg-gray-50/30 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${
                        isSubscribed
                          ? "bg-success-100 text-success-800 border border-success-200"
                          : "text-gray-400 bg-gray-200/60"
                      }`}
                    >
                      #{plan.planId}
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isSubscribed ? "text-success-900" : "text-gray-900"
                      }`}
                    >
                      {plan.planName}
                    </span>
                  </div>
                  {isSubscribed ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl text-success-700 bg-success-100 border border-success-200 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.plans.subscribed}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.planId)}
                      disabled={upgradingPlanId === plan.planId}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-primary hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow cursor-pointer shrink-0"
                    >
                      {upgradingPlanId === plan.planId ? (
                        <>
                          <svg
                            className="animate-spin h-3.5 w-3.5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span>{t.plans.upgrading}</span>
                        </>
                      ) : (
                        <span>{t.plans.upgrade}</span>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-tight">
          <CreditCard className="w-5 h-5 text-primary" />
          {t.common.paymentHistory}
        </h3>

        {/* Dynamic Aggregated Metrics */}
        {!paymentsLoading &&
          !paymentsError &&
          payments &&
          payments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success-50 text-success-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {t.users.totalSpent}
                  </span>
                  <span className="text-base font-bold text-success-700 block mt-0.5">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(stats.totalSpent)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {t.users.totalOrders}
                  </span>
                  <span className="text-base font-bold text-gray-900 block mt-0.5">
                    {stats.totalCount} ({stats.successfulCount}{" "}
                    {t.common.approved})
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-error-50 text-error-600 flex items-center justify-center shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {t.users.cancelledOrders}
                  </span>
                  <span className="text-base font-bold text-error-700 block mt-0.5">
                    {stats.cancelledCount}
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Transaction History Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t.common.time}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t.common.details}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t.reports.amount}
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {t.common.status}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 bg-white">
                {paymentsLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-primary"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-gray-500 font-semibold">
                          {t.users.loadingPaymentHistory}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : paymentsError ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-sm text-error-600 font-semibold"
                    >
                      {paymentsError}
                    </td>
                  </tr>
                ) : payments && payments.length > 0 ? (
                  payments.map((payment, idx) => {
                    let statusStyles = "";
                    let statusText = "";
                    switch (payment.status) {
                      case 1:
                        statusStyles =
                          "bg-success-50 text-success-700 border-success-100";
                        statusText = t.common.approved;
                        break;
                      case 2:
                        statusStyles =
                          "bg-error-50 text-error-700 border-error-100";
                        statusText = t.common.cancel;
                        break;
                      default:
                        statusStyles =
                          "bg-warning-50 text-warning-700 border-warning-100";
                        statusText = t.common.pending;
                    }

                    return (
                      <tr
                        key={payment.paymentId}
                        className={`hover:bg-gray-50/50 transition-colors ${
                          idx % 2 === 0 ? "bg-gray-50/20" : "bg-white"
                        }`}
                      >
                        <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap font-medium">
                          {formatDateTime(payment.createDate)}
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <div className="font-bold text-gray-900 text-xs">
                            {payment.method}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {t.plans.code}: {payment.orderCode}
                          </div>
                          {payment.adminNote && (
                            <div className="mt-2 text-[10px] text-gray-600 italic bg-gray-50 p-2 rounded-xl border border-gray-200 leading-normal max-w-sm">
                              {payment.adminNote}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-gray-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(payment.amount)}
                        </td>
                        <td className="px-5 py-4 text-xs">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusStyles}`}
                          >
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-sm text-gray-500 font-medium"
                    >
                      {t.users.noPaymentHistory}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  copyable = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gray-50 text-gray-500 shrink-0 border border-gray-100">
          {icon}
        </div>
        <div>
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {label}
          </span>
          <span className="block text-sm font-bold text-gray-800 mt-0.5">
            {value}
          </span>
        </div>
      </div>
      {copyable && value && (
        <button
          onClick={handleCopy}
          title="Copy value"
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
