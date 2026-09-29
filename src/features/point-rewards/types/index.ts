// ==========================================
// Point Rewards / Redemption - Type Definitions & API Schemas
// ==========================================

// --- UI / Legacy Types (Preserved for existing UI components) ---

export type ExchangeItemStatus = "active" | "paused" | "expired"

export interface ExchangeItem {
  id: string
  title: string
  sponsor: "CatSpeak" | "Chủ lớp"
  pointsCost: number
  stockCurrent: number
  stockTotal: number
  validity: string
  status: ExchangeItemStatus
  applicableCourse?: string
  limitPerStudent?: number
  startDate?: string
  endDate?: string
}

export type TransactionStatus = "success" | "failed"

export interface ExchangeTransaction {
  id: string
  stt: string
  studentName: string
  studentEmail: string
  studentAvatar?: string
  rewardTitle: string
  pointsDeducted: number
  codeResult: string
  time: string
  completedTime?: string
  status: TransactionStatus
  failReason?: string
}

export type PerformanceTrend = "up" | "stable" | "down"

export interface RewardPerformance {
  id: string
  title: string
  pointsCost: number
  exchangeCount: number
  totalPointsSpent: number
  remainingStock: number | "Vô hạn"
  trend: PerformanceTrend
}

export interface CatalogStats {
  totalItems: number
  activeItems: number
  pausedItems: number
  totalPointsExchanged: number
}

export interface ReportStats {
  totalExchanges: number
  exchangesGrowth: number
  totalPointsSpent: number
  pointsGrowth: number
  participatingStudents: number
  avgPerStudent: number
  remainingRewards: number
  lowStockCount: number
}

export interface ChartDropdownOption {
  id: "table" | "png" | "excel"
  label: string
}

// --- API DTOs & Schema Definitions ---

// Enums & Statuses
export type PointRedemptionItemStatus =
  | "Active"
  | "Paused"
  | "Expired"
  | "Exhausted"
  | "Pending"

export type PointRedemptionItemStatusFilter =
  | "Active"
  | "Paused"
  | "Expired"
  | "Exhausted"
  | "All"

export type PointRedemptionHistoryStatus = "Success" | "Failed"

export type PointRedemptionSponsorType = "CatSpeak" | "Instructor"

export type ReportPeriod = "ThisWeek" | "ThisMonth" | "LastMonth" | "Custom"

// Pagination structure
export interface PagedResultAdditionalData {
  currentPage: number
  pageSize: number
  totalCount: number
  totalPages: number
  summary: unknown | null
}

export interface PagedResult<T> {
  total_records: number
  page: number
  pageSize: number
  data: T[]
  additionalData: PagedResultAdditionalData
}

// 1. Summary Stats
export interface PointRedemptionSummaryDto {
  totalItems: number
  activeItems: number
  pausedItems: number
  totalPointsRedeemed: number
}

// 2. Eligible Vouchers
export interface ApplicableCourseDto {
  courseId: number
  courseName: string
}

export interface EligibleVoucherDto {
  id: number
  name: string
  applicableCourses: ApplicableCourseDto[]
}

// 3, 4, 5, 6, 7. Point Redemption Items
export interface PointRedemptionItemDto {
  id: number
  voucherName: string
  sponsorType?: PointRedemptionSponsorType | string | null
  courseId?: number | null
  pointsRequired: number
  totalQuantity?: number | null
  redeemedCount: number
  limitPerUser: number
  validFrom: string
  validTo?: string | null
  isPaused: boolean
  status: PointRedemptionItemStatus | string
}

export interface CreatePointRedemptionItemRequest {
  voucherId: number
  courseId?: number | null
  pointsRequired: number
  totalQuantity?: number | null
  limitPerUser: number
  validFrom: string
  validTo?: string | null
}

export interface UpdatePointRedemptionItemRequest {
  courseId?: number | null
  pointsRequired: number
  totalQuantity?: number | null
  limitPerUser: number
  validFrom: string
  validTo?: string | null
}

export interface GetPointRedemptionItemsParams {
  keyword?: string
  status?: PointRedemptionItemStatusFilter | string
  sponsorType?: PointRedemptionSponsorType | string
  page?: number
  pageSize?: number
}

export type GetPointRedemptionItemsResponse = PagedResult<PointRedemptionItemDto>

// 8, 9. Point Redemption History
export interface PointRedemptionHistoryDto {
  id: number
  transactionCode: string
  studentName: string
  studentEmail: string
  studentAvatar?: string | null
  voucherName: string
  sponsorType?: PointRedemptionSponsorType | string | null
  pointsDeducted: number
  resultCode: string
  status: PointRedemptionHistoryStatus | string
  createdAt: string
  completedAt?: string | null
  failedReason?: string | null
}

export interface PointRedemptionHistoryDetailDto {
  id: number
  transactionCode: string
  studentName: string
  studentEmail: string
  studentAvatar?: string | null
  voucherName: string
  sponsorType?: PointRedemptionSponsorType | string | null
  pointsLabel: string
  pointsDeducted: number
  resultCode: string
  status: PointRedemptionHistoryStatus | string
  createdAt: string
  completedAt?: string | null
  failedReason?: string | null
}

export interface GetPointRedemptionHistoryParams {
  keyword?: string
  itemId?: number
  fromDate?: string
  toDate?: string
  sponsorType?: PointRedemptionSponsorType | string
  page?: number
  pageSize?: number
}

export type GetPointRedemptionHistoryResponse =
  PagedResult<PointRedemptionHistoryDto>

// 10. Reports & Statistics
export interface RedemptionTimePointDto {
  label: string
  value: number
}

export interface PopularRewardDto {
  label: string
  value: number
}

export interface RewardDetailDto {
  itemId: number
  voucherName: string
  pointsRequired: number
  redemptionsThisPeriod: number
  redemptionsPrevPeriod: number
  totalPointsSpent: number
  remainingInventory: number | string
  trend: string
}

export interface PointRedemptionReportsDto {
  totalRedemptions: number
  totalRedemptionsChangePercent: number
  totalPointsSpent: number
  totalPointsSpentChangePercent: number
  uniqueUsersCount: number
  remainingInventory: number
  lowStockItemsCount: number
  redemptionsOverTime: RedemptionTimePointDto[]
  popularRewards: PopularRewardDto[]
  rewardDetails: RewardDetailDto[]
}

export interface GetPointRedemptionReportsParams {
  period?: ReportPeriod | string
}

// 11, 12. Export
export interface ExportPointRedemptionHistoryParams {
  keyword?: string
  itemId?: number
  fromDate?: string
  toDate?: string
  sponsorType?: PointRedemptionSponsorType | string
}

export interface ExportPointRedemptionReportsParams {
  period?: ReportPeriod | string
}

