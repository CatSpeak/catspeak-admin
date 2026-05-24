import type { Report, ReportDecision } from "./ReportsTable";

interface ReportRowProps {
  report: Report;
  onDecision: (reportId: string, decision: ReportDecision) => void;
}

export default function ReportRow({ report, onDecision }: ReportRowProps) {
  const hasDecision = report.decision !== undefined;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <th
        scope="row"
        className="px-6 py-4 text-left text-sm font-medium text-gray-800 whitespace-nowrap"
      >
        {report.letterId}
      </th>

      <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
        {report.ownerId}
      </td>

      <td className="px-6 py-4 text-sm text-gray-800 text-center">
        {report.reportersCount}
      </td>

      <td className="px-6 py-4 text-sm text-gray-700">
        <div className="max-w-md">
          {report.content}
          <div className="mt-1 border-t border-dotted border-gray-300" />
        </div>
      </td>

      <td className="px-6 py-4">
        {hasDecision ? (
          <span
            className={`inline-flex rounded-lg px-3 py-1.5 text-sm font-semibold ${report.decision === "violation"
                ? "bg-red-50 text-red-600"
                : "bg-amber-50 text-amber-700"
              }`}
          >
            {report.decision === "violation" ? "Violation" : "Innocent"}
          </span>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 min-w-max">
            <button
              type="button"
              onClick={() => onDecision(report.id, "innocent")}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
              style={{
                backgroundColor: "#FFF4E6",
                color: "#F59E0B",
                border: "1px solid #FDE68A",
              }}
              aria-label={`Mark report ${report.id} as innocent`}
            >
              Innocent
            </button>

            <button
              type="button"
              onClick={() => onDecision(report.id, "violation")}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
              style={{
                backgroundColor: "transparent",
                color: "#EF4444",
                border: "2px solid #EF4444",
              }}
              aria-label={`Mark report ${report.id} as a violation`}
            >
              Violation
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
