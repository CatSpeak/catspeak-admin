import { useState } from "react";
import Card from "../../../components/ui/Card";
import ReportRow from "./ReportRow";

export interface Report {
  id: string;
  letterId: string;
  ownerId: string;
  reportersCount: number;
  content: string;
}

// Mock data - replace with API call later
const mockReports: Report[] = [
  {
    id: "1",
    letterId: "obc111111",
    ownerId: "ABC22222",
    reportersCount: 1,
    content: "Tôi muốn tìm bạn chơi buổi tối",
  },
  {
    id: "2",
    letterId: "obc111111",
    ownerId: "ABC22222",
    reportersCount: 2,
    content: "Tôi muốn tìm bạn chơi buổi tối",
  },
];

export default function ReportsTable() {
  const [reports] = useState<Report[]>(mockReports);

  const handleDecision = (
    reportId: string,
    decision: "innocent" | "violation",
  ) => {
    console.log(`Report ${reportId}: ${decision}`);
    // TODO: Implement API call to update report decision
  };

  return (
    <Card noPadding className="overflow-hidden">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Table Header */}
          <thead>
            <tr style={{ backgroundColor: "var(--color-primary)" }}>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap">
                Letter's ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap">
                Owner's ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap">
                Reporters count
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap">
                Content's Letter
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap">
                Decision
              </th>
            </tr>
          </thead>

          {/* Table Body */}
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
