import { useState } from "react";
import Card from "../../../components/ui/Card";
import ReportRow from "./ReportRow";

export type ReportDecision = "innocent" | "violation";

export interface Report {
  id: string;
  letterId: string;
  ownerId: string;
  reportersCount: number;
  content: string;
  decision?: ReportDecision;
}

const mockReports: Report[] = [
  {
    id: "1",
    letterId: "obc111111",
    ownerId: "ABC22222",
    reportersCount: 1,
    content: "I want to find a conversation partner tonight.",
  },
  {
    id: "2",
    letterId: "obc111111",
    ownerId: "ABC22222",
    reportersCount: 2,
    content: "I want to find a conversation partner tonight.",
  },
];

export default function ReportsTable() {
  const [reports, setReports] = useState<Report[]>(mockReports);

  const handleDecision = (reportId: string, decision: ReportDecision) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, decision } : report,
      ),
    );
  };

  return (
    <Card noPadding className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <caption className="sr-only">Reported letters awaiting review</caption>
          <thead>
            <tr style={{ backgroundColor: "var(--color-primary)" }}>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
              >
                Letter's ID
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
              >
                Owner's ID
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
              >
                Reporters count
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
              >
                Content's Letter
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
              >
                Decision
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {reports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onDecision={handleDecision}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
