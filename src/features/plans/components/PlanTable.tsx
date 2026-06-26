import React from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import { formatDateTime } from "../../../lib/utils";
import type { Plan } from "../../../entities/types";

interface PlanTableProps {
  plans: Plan[];
  loading: boolean;
  error: Error | null;
  onDelete: (id: number) => void;
}

const PlanTable: React.FC<PlanTableProps> = ({ plans, loading, error, onDelete }) => {
  const navigate = useNavigate();

  const columns: Column<Plan>[] = [
    {
      header: "Plan Name",
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.iconUrl ? (
            <img src={p.iconUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Icon</span>
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{p.planName}</p>
            <p className="text-xs text-gray-500 max-w-[200px] truncate">{p.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      render: (p) => (
        <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide capitalize">
          {p.applicableRole}
        </span>
      ),
    },
    {
      header: "Price",
      render: (p) => (
        <div>
          <p className="font-semibold text-gray-900">{p.priceVnd.toLocaleString("vi-VN")} VND</p>
          <p className="text-xs text-gray-500">/ {p.billingCycle.toLowerCase()}</p>
        </div>
      ),
    },
    {
      header: "Status",
      render: (p) => {
        let label = p.packageStatus || "Unknown";
        let colorClass = "bg-gray-50 text-gray-600";
        let dotClass = "bg-gray-500";
        
        if (p.packageStatus === "Published") {
          label = "Public";
          colorClass = "bg-green-50 text-green-600";
          dotClass = "bg-green-500";
        } else if (p.packageStatus === "Hidden") {
          label = "Private";
          colorClass = "bg-orange-50 text-orange-600";
          dotClass = "bg-orange-500";
        } else if (p.packageStatus === "Draft") {
          label = "Draft";
          colorClass = "bg-yellow-50 text-yellow-600";
          dotClass = "bg-yellow-500";
        } else if (p.packageStatus === "Archived") {
          label = "Archived";
          colorClass = "bg-gray-50 text-gray-600";
          dotClass = "bg-gray-500";
        }

        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
            {label}
          </span>
        );
      },
    },
    {
      header: "Features",
      render: (p) => {
        const count = p.subscriptionFeatures?.length || 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{count}</span>
            <span className="text-xs text-gray-500">features</span>
          </div>
        );
      },
    },
    {
      header: "Last Updated",
      render: (p) => <span className="text-sm text-gray-600">{formatDateTime(p.lastEdited)}</span>,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={plans}
      keyExtractor={(p) => p.planId}
      loading={loading}
      error={error?.message || null}
      onRowClick={(p) => navigate(`/plans/${p.planId}`)}
      renderActions={(p) => (
        <div className="flex items-center justify-end gap-2 pr-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(p.planId);
            }}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
            title="Delete Plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    />
  );
};

export default PlanTable;
