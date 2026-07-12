import { useState } from "react";
import Table from "../../../components/ui/table/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

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
    decision: "innocent",
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
    <Table<Report>
      fetcher={() => {
        const data = reports;
        return {
          data,
          total: data.length,
        };
      }}
      headers={[
        {
          name: "ID",
          accessorKey: "letterId",
        },
        {
          name: "Owner's ID",
          accessorKey: "ownerId",
        },
        {
          name: "Reporters count",
          accessorKey: "reportersCount",
        },
        {
          name: "Content",
          accessorKey: "content",
        },
        {
          name: "Decision",
          accessorKey: "decision",
          render: (r) => {
            if (r.decision) {
              switch (r.decision) {
                case "innocent":
                  return <Badge title="Innocent" type="Green" />;
                case "violation":
                  return <Badge title="Violation" type="Red" />;
                default:
                  return <Badge title={r.decision || "Unknown"} type="Gray" />;
              }
            } else return <Badge title="Undecided" type="Gray" />;
          },
        },
        {
          name: "",
          allowSort: false,
          render: (r) => {
            if (!r.decision) {
              return (
                <div className="flex flex-col sm:flex-row gap-2 min-w-max">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDecision(r.id, "violation")}
                    aria-label={`Mark report ${r.id} as a violation`}
                  >
                    Violation
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDecision(r.id, "innocent")}
                    aria-label={`Mark report ${r.id} as innocent`}
                  >
                    Innocent
                  </Button>
                </div>
              );
            }
          },
        },
      ]}
    />
    // <Card noPadding className="overflow-hidden">
    //   <div className="overflow-x-auto">
    //     <table className="w-full">
    //       <caption className="sr-only">Reported letters awaiting review</caption>
    //       <thead>
    //         <tr style={{ backgroundColor: "var(--color-primary)" }}>
    //           <th
    //             scope="col"
    //             className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
    //           >
    //             Letter's ID
    //           </th>
    //           <th
    //             scope="col"
    //             className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
    //           >
    //             Owner's ID
    //           </th>
    //           <th
    //             scope="col"
    //             className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
    //           >
    //             Reporters count
    //           </th>
    //           <th
    //             scope="col"
    //             className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
    //           >
    //             Content's Letter
    //           </th>
    //           <th
    //             scope="col"
    //             className="px-6 py-4 text-left text-sm font-semibold text-white whitespace-nowrap"
    //           >
    //             Decision
    //           </th>
    //         </tr>
    //       </thead>

    //       <tbody className="bg-white divide-y divide-gray-200">
    //         {reports.map((report) => (
    //           <ReportRow
    //             key={report.id}
    //             report={report}
    //             onDecision={handleDecision}
    //           />
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>
    // </Card>
  );
}
