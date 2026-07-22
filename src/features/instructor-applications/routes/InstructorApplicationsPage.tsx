import { IdCardLanyard } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import Table from "../../../components/ui/table/Table";
import type { InstructorApplication } from "../types";
import { getInstructorApplications } from "../api/getInstructorApplications";
import { useNavigate } from "react-router-dom";
import { formatDateLong } from "../../../lib/utils";
import Badge from "../../../components/ui/Badge";
import { useLanguage } from "../../../stores/languageStore";

export default function InstructorApplicationsPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<IdCardLanyard />}
        title={t.instructorApplications.title}
        desc={t.instructorApplications.desc}
      />

      <Table<InstructorApplication>
        fetcher={async (page, pageSize) => {
          const data = await getInstructorApplications({ page, pageSize });
          return {
            data: data.items,
            total: data.totalCount,
          };
        }}
        onClickRow={(app) =>
          navigate(`/instructor-applications/${app.profileId}`)
        }
        headers={[
          {
            name: t.users.id,
            accessorKey: "profileId",
          },
          {
            name: t.users.username,
            accessorKey: "fullName",
            render: (app) => (
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {app.fullName}
                </div>
                <div className="text-xs text-gray-500">{app.username}</div>
              </div>
            ),
          },
          {
            name: t.users.email,
            accessorKey: "accountEmail",
            render: (app) => (
              <span className="text-primary underline">{app.accountEmail}</span>
            ),
          },
          {
            name: t.users.phone,
            accessorKey: "phoneNumber",
            render: (app) => <>{app.phoneNumber || "—"}</>,
          },
          {
            name: t.common.createdDate,
            accessorKey: "submittedAt",
            render: (app) => (
              <span className="whitespace-nowrap text-gray-600">
                {formatDateLong(app.submittedAt)}
              </span>
            ),
          },
          {
            name: t.common.status,
            accessorKey: "status",
            values: ["Pending", "Approved", "Rejected", "RequestEdit"],
            render: (p) => {
              switch (p.status) {
                case "Pending":
                  return <Badge title={t.common.pending} type="Blue" />;
                case "Approved":
                  return <Badge title={t.common.approved} type="Green" />;
                case "Rejected":
                  return <Badge title={t.common.rejected} type="Red" />;
                case "RequestEdit":
                  return <Badge title="Request Edit" type="Orange" />;
                default:
                  return <Badge title={p.status || "Unknown"} type="Gray" />;
              }
            },
          },
        ]}
      />
    </div>
  );
}
