// ==========================================
// Voucher Management System - Type Definitions
// ==========================================

// --- Enums & Value Types ---

export type DiscountType = "Percentage" | "FixedAmount";

export const DiscountTypeEnum = {
  Percentage: 1,
  FixedAmount: 2,
} as const;
export type DiscountTypeEnum =
  (typeof DiscountTypeEnum)[keyof typeof DiscountTypeEnum];

export type VoucherSponsorType = "CatSpeak" | "Instructor";

export const VoucherSponsorTypeEnum = {
  CatSpeak: 1,
  Instructor: 2,
} as const;
export type VoucherSponsorTypeEnum =
  (typeof VoucherSponsorTypeEnum)[keyof typeof VoucherSponsorTypeEnum];

export type VoucherScopeType = "All" | "SpecificCourses" | "SpecificClasses";

export const VoucherScopeTypeEnum = {
  All: 1,
  SpecificCourses: 2,
  SpecificClasses: 3,
} as const;
export type VoucherScopeTypeEnum =
  (typeof VoucherScopeTypeEnum)[keyof typeof VoucherScopeTypeEnum];

export type VoucherStatus =
  | "Draft"
  | "Active"
  | "Disabled"
  | "Expired"
  | "Exhausted"
  | "PendingDeposit"
  | "PendingApproval"
  | "Rejected"
  | "Stopped";

export const VoucherStatusEnum = {
  Draft: 1,
  Active: 2,
  Disabled: 3,
  Expired: 4,
  Exhausted: 5,
  PendingDeposit: 6,
  PendingApproval: 7,
  Rejected: 8,
  Stopped: 9,
} as const;
export type VoucherStatusEnum =
  (typeof VoucherStatusEnum)[keyof typeof VoucherStatusEnum];

export type VoucherUsageStatus = "Pending" | "Success" | "Cancelled";

export const VoucherUsageStatusEnum = {
  Pending: 1,
  Success: 2,
  Cancelled: 3,
} as const;
export type VoucherUsageStatusEnum =
  (typeof VoucherUsageStatusEnum)[keyof typeof VoucherUsageStatusEnum];

// --- Common & Pagination ---

export interface VoucherPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export interface VoucherReferenceItem {
  id: number;
  name: string;
  image?: string | null;
  subtitle?: string | null;
}

// --- Stats ---

export interface VoucherStats {
  total: number;
  active: number;
  expired: number;
  disabled: number;
  draft: number;
  pendingApproval: number;
  pendingDeposit: number;
  rejected: number;
  stopped: number;
  inactive: number;
}

// --- Voucher List Item & Responses ---

export interface VoucherListItem {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  discountType: DiscountType | string;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  sponsorType: VoucherSponsorType | string;
  scopeType: VoucherScopeType | string;
  validFrom: string;
  validTo?: string | null;
  isNeverExpired: boolean;
  usedCount: number;
  totalUsageLimit?: number | null;
  isUnlimitedUsage: boolean;
  status: VoucherStatus | string;
  depositRequired?: number | null;
  depositAmount?: number | null;
  maxBudget?: number | null;
  rejectionReason?: string | null;
  createdAt: string;
}

export interface GetVouchersResponse {
  data: VoucherListItem[];
  pagination: VoucherPagination;
}

// --- Voucher Detail ---

export interface VoucherDetail {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  discountType: DiscountType | string;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  minLearners?: number | null;
  validFrom: string;
  validTo?: string | null;
  isNeverExpired: boolean;
  sponsorType: VoucherSponsorType | string;
  scopeType: VoucherScopeType | string;
  isOnlyNewUser: boolean;
  isNotCombineOther: boolean;
  totalUsageLimit?: number | null;
  isUnlimitedUsage: boolean;
  perUserLimit?: number | null;
  dailyLimit?: number | null;
  status: VoucherStatus | string;
  createdAt: string;
  createdBy?: number | null;
  depositRequired?: number | null;
  depositAmount?: number | null;
  depositConfirmedAt?: string | null;
  depositConfirmedBy?: number | null;
  depositTransactionContent?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: number | null;
  rejectionReason?: string | null;
  rejectionNote?: string | null;
  maxBudget?: number | null;
  stoppedAt?: string | null;
  stoppedBy?: number | null;
  instructors?: VoucherReferenceItem[];
  courses?: VoucherReferenceItem[];
  classes?: VoucherReferenceItem[];
  usedCount: number;
  usagePercentage?: number | null;
  totalDiscountAmount?: number | null;
  successfulOrdersCount?: number | null;
  depositPaid?: number | null;
  depositUsed?: number | null;
  depositRemaining?: number | null;
  estimatedRefund?: number | null;
}

// --- Usages History ---

export interface VoucherUsageHistoryItem {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  orderId: number;
  classId?: number | null;
  className?: string | null;
  classThumbnail?: string | null;
  discountAmount: number;
  usedAt: string;
  status: VoucherUsageStatus | string;
}

export interface GetVoucherUsagesResponse {
  data: VoucherUsageHistoryItem[];
  pagination: VoucherPagination;
}

// --- Request Payloads ---

export interface CreateVoucherRequest {
  isDraft?: boolean;
  code: string;
  title: string;
  description?: string | null;
  discountType: DiscountType | DiscountTypeEnum | number;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderAmount?: number | null;
  minLearners?: number | null;
  validFrom: string;
  validTo?: string | null;
  isNeverExpired?: boolean;
  sponsorType: VoucherSponsorType | VoucherSponsorTypeEnum | number;
  scopeType: VoucherScopeType | VoucherScopeTypeEnum | number;
  isOnlyNewUser?: boolean;
  isNotCombineOther?: boolean;
  isUnlimitedUsage?: boolean;
  totalUsageLimit?: number | null;
  perUserLimit?: number | null;
  dailyLimit?: number | null;
  maxBudget?: number | null;
  instructorIds?: number[];
  courseIds?: number[];
  classIds?: number[];
}

export interface UpdateVoucherRequest extends Partial<CreateVoucherRequest> {
  id?: number;
}

export interface GenerateVoucherCodeResponse {
  code: string;
}

export interface RejectVoucherRequest {
  reason: string;
  note?: string | null;
}

export interface ExtendVoucherRequest {
  validTo: string;
}

export interface IncreaseVoucherLimitRequest {
  additionalLimit?: number;
  totalUsageLimit?: number;
}

// --- Query Parameters ---

export interface GetVouchersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: VoucherStatus | string;
  discountType?: DiscountType | string;
  sponsorType?: VoucherSponsorType | string;
}

export interface GetVoucherUsagesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: VoucherUsageStatus | string;
}

// --- Error Response ---

export interface VoucherApiErrorResponse {
  errorCode: string;
  message: string;
  statusCode: number;
}
