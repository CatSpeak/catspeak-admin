import React from "react"

interface BugReportBreadcrumbsTabProps {
  networkBreadcrumbs: any[]
  bugT: any
}

export default function BugReportBreadcrumbsTab({
  networkBreadcrumbs,
  bugT,
}: BugReportBreadcrumbsTabProps) {
  return (
    <div className="space-y-3 font-mono text-xs animate-fade-in">
      <div className="font-bold text-gray-700 text-xs font-sans">
        {bugT.tabContext || "Ngữ cảnh gần nhất trước thời điểm báo lỗi:"}
      </div>
      {networkBreadcrumbs.length === 0 ? (
        <div className="text-gray-400 text-xs pl-2 font-sans bg-white p-6 rounded-xl border border-gray-200 text-center">
          {bugT.noBreadcrumbs || "Chưa ghi nhận request mạng nào."}
        </div>
      ) : (
        networkBreadcrumbs.map((n: any, i: number) => (
          <div
            key={i}
            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              n.ok
                ? "bg-white border-gray-200 text-gray-800"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                {n.method}
              </span>
              <span className="truncate text-gray-700">{n.url}</span>
            </div>
            <span className="font-bold shrink-0 ml-2">[{n.status}]</span>
          </div>
        ))
      )}
    </div>
  )
}
