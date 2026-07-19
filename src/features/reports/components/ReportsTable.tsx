import { useNavigate } from "react-router-dom";
import Table from "../../../components/ui/table/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { getLetterReports, type LetterReport } from "../api/letterReports";
import { Eye } from "lucide-react";

export default function ReportsTable() {
  const navigate = useNavigate();

  return (
    <Table<LetterReport>
      fetcher={async (page = 1, pageSize = 10) => {
        try {
          const response = await getLetterReports(page, pageSize);
          return {
            data: response.data || [],
            total: response.total_records || 0,
          };
        } catch (error) {
          console.error("Error fetching letter reports:", error);
          return {
            data: [],
            total: 0,
          };
        }
      }}
      onClickRow={(r) => navigate(`/reports/${r.id}`)}
      headers={[
        {
          name: "ID",
          accessorKey: "id",
          render: (r) => (
            <span className="font-semibold text-gray-900">
              #{r.id}
            </span>
          ),
        },
        {
          name: "Author",
          accessorKey: "authorUsername",
          render: (r) => (
            <span className="font-medium text-gray-700">
              {r.authorUsername || r.ownerId || "—"}
            </span>
          ),
        },
        {
          name: "Content",
          accessorKey: "content",
          render: (r) => (
            <p className="text-sm text-gray-650 max-w-md truncate" title={r.content}>
              {r.content}
            </p>
          ),
        },
        {
          name: "Language",
          accessorKey: "languageCommunity",
          render: (r) => (
            <span className="inline-block px-2 py-0.5 text-xs rounded bg-primary/10 text-primary font-medium">
              {r.languageCommunity || "—"}
            </span>
          ),
        },
        {
          name: "Status",
          accessorKey: "status",
          render: (r) => {
            const statusVal = r.status !== undefined ? r.status : r.decision;
            if (statusVal === 1 || statusVal === "innocent" || statusVal === "Innocent") {
              return <Badge title="Innocent" type="Green" />;
            }
            if (statusVal === 2 || statusVal === "violation" || statusVal === "Violation") {
              return <Badge title="Violation" type="Red" />;
            }
            if (statusVal === 0 || statusVal === "pending" || statusVal === "Pending") {
              return <Badge title="Pending" type="Yellow" />;
            }
            return <Badge title={String(statusVal ?? "Undecided")} type="Gray" />;
          },
        },
        {
          name: "",
          allowSort: false,
          render: (r) => (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/reports/${r.id}`);
              }}
              aria-label={`View report ${r.id} details`}
              className="inline-flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              Details
            </Button>
          ),
        },
      ]}
    />
  );
}
