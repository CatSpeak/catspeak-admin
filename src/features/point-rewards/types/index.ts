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
