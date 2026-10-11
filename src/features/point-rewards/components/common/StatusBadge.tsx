import React from "react"
import type { ExchangeItemStatus, TransactionStatus, PerformanceTrend } from "../../types"

export const ItemStatusBadge: React.FC<{ status: ExchangeItemStatus }> = ({ status }) => {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
          Hoạt động
        </span>
      )
    case "expired":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-500 border border-rose-200 whitespace-nowrap">
          Hết hạn
        </span>
      )
    case "paused":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
          Tạm dừng
        </span>
      )
  }
}

export const TransactionStatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  if (status === "success") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
        Thành công
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-500 border border-rose-200 whitespace-nowrap">
      Thất bại
    </span>
  )
}

export const SponsorBadge: React.FC<{ sponsor: "CatSpeak" | "Chủ lớp" | string }> = ({
  sponsor,
}) => {
  if (sponsor === "CatSpeak") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
        CatSpeak
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
      Chủ lớp
    </span>
  )
}

export const TrendBadge: React.FC<{ trend: PerformanceTrend }> = ({ trend }) => {
  switch (trend) {
    case "up":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-200 whitespace-nowrap">
          + Tăng
        </span>
      )
    case "stable":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
          — Ổn định
        </span>
      )
    case "down":
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">
          + Giảm
        </span>
      )
  }
}
