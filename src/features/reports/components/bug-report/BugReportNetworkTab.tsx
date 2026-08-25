import { formatDateTime } from "../../../../lib/utils"

interface BugReportNetworkTabProps {
  failedRequests: any[]
  bugT: any
}

export default function BugReportNetworkTab({
  failedRequests,
  bugT,
}: BugReportNetworkTabProps) {
  if (failedRequests.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-xl border border-gray-200 animate-fade-in">
        {bugT.noNetworkErrors || "Không phát hiện lỗi mạng (4xx/5xx) nào."}
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {failedRequests.map((req: any, index: number) => (
        <div
          key={index}
          className="bg-white p-4 rounded-xl border border-red-200 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between text-xs border-b border-red-100 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded">
                {req.method || "GET"}
              </span>
              <span className="font-bold text-red-600">
                HTTP {req.status}
              </span>
              <span className="text-gray-500 font-mono truncate max-w-md">
                {req.url}
              </span>
            </div>
            <span className="text-gray-400">
              {req.timestamp ? formatDateTime(req.timestamp) : ""}
            </span>
          </div>

          {req.requestBody && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-gray-500">
                {bugT.reqPayload || "Payload gửi lên (Request Body):"}
              </div>
              <pre className="p-2.5 bg-gray-50 rounded border border-gray-200 text-xs font-mono overflow-x-auto text-gray-800">
                {typeof req.requestBody === "object"
                  ? JSON.stringify(req.requestBody, null, 2)
                  : req.requestBody}
              </pre>
            </div>
          )}

          {req.responseBody && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-gray-500">
                {bugT.resBody || "Phản hồi từ máy chủ (Response Body):"}
              </div>
              <pre className="p-2.5 bg-red-50/50 rounded border border-red-200 text-xs font-mono overflow-x-auto text-red-900">
                {typeof req.responseBody === "object"
                  ? JSON.stringify(req.responseBody, null, 2)
                  : req.responseBody}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
