import { formatDateTime } from "../../../../lib/utils"

interface BugReportConsoleTabProps {
  consoleErrors: any[]
  bugT: any
}

export default function BugReportConsoleTab({
  consoleErrors,
  bugT,
}: BugReportConsoleTabProps) {
  if (consoleErrors.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200 animate-fade-in">
        {bugT.noConsoleErrors || "Không phát hiện lỗi Console / Runtime Exception nào."}
      </div>
    )
  }

  return (
    <div className="space-y-3 font-mono text-xs animate-fade-in">
      {consoleErrors.map((log: any, index: number) => (
        <div
          key={index}
          className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1"
        >
          <div className="flex items-center justify-between text-[11px] text-amber-700 font-bold font-sans">
            <span>[Console Error]</span>
            <span>{log.timestamp ? formatDateTime(log.timestamp) : ""}</span>
          </div>
          <div className="whitespace-pre-wrap break-all text-xs text-red-700 font-mono">
            {log.message}
          </div>
        </div>
      ))}
    </div>
  )
}
