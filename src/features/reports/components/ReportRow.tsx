import type { Report } from "./ReportsTable";

interface ReportRowProps {
  report: Report;
  onDecision: (reportId: string, decision: "innocent" | "violation") => void;
}

export default function ReportRow({ report, onDecision }: ReportRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Letter ID */}
      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
        {report.letterId}
      </td>

      {/* Owner ID */}
      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
        {report.ownerId}
      </td>

      {/* Reporters Count */}
      <td className="px-6 py-4 text-sm text-gray-800 text-center">
        {report.reportersCount}
      </td>

      {/* Content */}
      <td className="px-6 py-4 text-sm text-gray-700">
        <div className="max-w-md">
          {report.content}
          <div className="mt-1 border-t border-dotted border-gray-300" />
        </div>
      </td>

      {/* Decision Buttons */}
      <td className="px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-2 min-w-max">
          {/* Innocent Button */}
          <button
            onClick={() => onDecision(report.id, "innocent")}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            style={{
              backgroundColor: "#FFF4E6",
              color: "#F59E0B",
              border: "1px solid #FDE68A",
            }}
          >
            Innocent
          </button>

          {/* Violation Button */}
          <button
            onClick={() => onDecision(report.id, "violation")}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
            style={{
              backgroundColor: "transparent",
              color: "#EF4444",
              border: "2px solid #EF4444",
            }}
          >
            Violation
          </button>
        </div>
      </td>
    </tr>
  );
}
