import React from "react";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import PlanSummaryCards from "./components/PlanSummaryCards";
import { usePlans } from "./hooks/usePlans";
import { PageHeader } from "../../components/ui/PageHeader";
import type { Plan } from "../../entities/types";
import Table from "../../components/ui/table/Table";
import { formatDateTime } from "../../lib/utils";
import Badge from "../../components/ui/Badge";

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { plans, stats } = usePlans();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FileText />}
        title="Plans"
        desc="Manage, create and configure service plans on the system"
        rightButtons={[
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/plans/create")}
          >
            <Plus className="size-4 mr-1" />
            Create Plan
          </Button>,
        ]}
      />

      <PlanSummaryCards stats={stats} />

      <Table<Plan>
        fetcher={async () => {
          const data = plans;
          return {
            data,
            total: data.length,
          };
        }}
        onClickRow={(p: Plan) => navigate(`/plans/${p.planId}`)}
        headers={[
          {
            name: "Name",
            accessorKey: "planName",
            render: (p) => (
              <div className="flex items-center gap-3">
                {p.iconUrl ? (
                  <img
                    src={p.iconUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Icon</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{p.planName}</p>
                  <p className="text-xs text-gray-500 max-w-50 truncate">
                    {p.description}
                  </p>
                </div>
              </div>
            ),
          },
          {
            name: "Role",
            accessorKey: "applicableRole",
          },
          {
            name: "Price",
            accessorKey: "priceVnd",
            render: (p) => (
              <div>
                <p className="font-semibold text-gray-900">
                  {p.priceVnd.toLocaleString("vi-VN")} VND
                </p>
                <p className="text-xs text-gray-500">
                  / {p.billingCycle.toLowerCase()}
                </p>
              </div>
            ),
          },
          {
            name: "Status",
            accessorKey: "packageStatus",
            values: ["Public", "Published", "Draft", "Archived"],
            render: (p) => {
              switch (p.packageStatus) {
                case "Public":
                  return <Badge title="Public" type="Green" />;
                case "Published":
                  return <Badge title="Published" type="Blue" />;
                case "Draft":
                  return <Badge title="Draft" type="Orange" />;
                case "Archived":
                  return <Badge title="Archived" type="Gray" />;
                default:
                  return (
                    <Badge title={p.packageStatus || "Unknown"} type="Gray" />
                  );
              }
            },
          },
          {
            name: "Features",
            accessorKey: "subscriptionFeatures",
            render: (p) => {
              const count = p.subscriptionFeatures?.length || 0;
              return (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {count}
                  </span>
                  <span className="text-xs text-gray-500">features</span>
                </div>
              );
            },
          },
          {
            name: "Last Updated",
            accessorKey: "lastEdited",
            render: (p) => (
              <span className="text-sm text-gray-600">
                {formatDateTime(p.lastEdited)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
};

export default PlansPage;
