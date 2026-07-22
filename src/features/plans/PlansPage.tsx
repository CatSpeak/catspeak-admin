import React from "react";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import PlanSummaryCards from "./components/PlanSummaryCards";
import { usePlans } from "./hooks/usePlans";
import { PageHeader } from "../../components/ui/PageHeader";
import type { Plan } from "../../entities/types";
import Table from "../../components/ui/table/Table";
import { getPlans, type PlanSortBy, type GetPlansParams } from "./api/getPlans";
import { formatDateTime } from "../../lib/utils";
import Badge from "../../components/ui/Badge";
import { useLanguage } from "../../stores/languageStore";

const PlansPage: React.FC = () => {
  const navigate = useNavigate();
  const { plans, stats } = usePlans();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<FileText />}
        title={t.plans.title}
        desc={t.plans.desc}
        rightButtons={[
          <Button
            key="create-plan"
            variant="primary"
            size="sm"
            onClick={() => navigate("/plans/create")}
          >
            <Plus className="size-4 mr-1" />
            {t.plans.createPlan}
          </Button>,
        ]}
      />

      <PlanSummaryCards stats={stats} />

      <Table<Plan>
        fetcher={async () => {
          return {
            data: plans?.data || [],
            total: plans?.total_records || 0,
          };
        }}
        sorter={async (attribute, sortOrder) => {
          let sortBy: PlanSortBy | undefined = undefined;
          if (attribute === "planName") sortBy = "PlanName";
          else if (attribute === "priceVnd") sortBy = "Price";
          else if (attribute === "lastEdited" || attribute === "createDate")
            sortBy = "CreateDate";

          const order =
            sortOrder === "asc"
              ? "Asc"
              : sortOrder === "desc"
                ? "Desc"
                : undefined;
          const res = await getPlans({ SortBy: sortBy, SortOrder: order });
          return res.data;
        }}
        filter={async (attribute, value) => {
          const params: GetPlansParams = {};
          if (attribute === "global" || attribute === "planName") {
            params.PlanName = value ? String(value) : undefined;
          } else if (attribute === "packageStatus" && value) {
            params.PackageStatuses = Array.isArray(value)
              ? value.map(String)
              : [String(value)];
          }
          const res = await getPlans(params);
          return res.data;
        }}
        onClickRow={(p: Plan) => navigate(`/plans/${p.planId}`)}
        headers={[
          {
            name: t.users.username,
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
            name: t.users.role,
            accessorKey: "applicableRole",
          },
          {
            name: t.plans.price,
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
            name: t.common.status,
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
            name: t.plans.features,
            accessorKey: "subscriptionFeatures",
            render: (p) => {
              const count = p.subscriptionFeatures?.length || 0;
              return (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {count}
                  </span>
                  <span className="text-xs text-gray-500">{t.plans.features.toLowerCase()}</span>
                </div>
              );
            },
          },
          {
            name: t.plans.lastUpdated,
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
