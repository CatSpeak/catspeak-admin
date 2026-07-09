import { IdCardLanyard } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import ApplicationTable from "../components/ApplicationTable";
import Table from "../../../components/ui/table/Table";
import type { InstructorApplication } from "../types";
import { getInstructorApplications } from "../api/getInstructorApplications";
import { useNavigate } from "react-router-dom";
import { formatDateLong } from "../../../lib/utils";
import Badge from "../../../components/ui/Badge";

export default function InstructorApplicationsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<IdCardLanyard />}
        title="Instructor Applications"
        desc="Review and manage instructor profile applications."
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
            name: "ID",
            accessorKey: "profileId",
          },
          {
            name: "Name",
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
            name: "Email",
            accessorKey: "accountEmail",
            render: (app) => (
              <span className="text-primary underline">{app.accountEmail}</span>
            ),
          },
          {
            name: "Phone",
            accessorKey: "phoneNumber",
            render: (app) => <>{app.phoneNumber || "—"}</>,
          },
          {
            name: "Submitted",
            accessorKey: "submittedAt",
            render: (app) => (
              <span className="whitespace-nowrap text-gray-600">
                {formatDateLong(app.submittedAt)}
              </span>
            ),
          },
          {
            name: "Status",
            accessorKey: "status",
            values: ["Pending", "Approved", "Rejected", "RequestEdit"],
            render: (p) => {
              switch (p.status) {
                case "Pending":
                  return <Badge title="Public" type="Blue" />;
                case "Approved":
                  return <Badge title="Approved" type="Green" />;
                case "Rejected":
                  return <Badge title="Rejected" type="Red" />;
                case "RequestEdit":
                  return <Badge title="Request Edit" type="Orange" />;
                default:
                  return <Badge title={p.status || "Unknown"} type="Gray" />;
              }
            },
          },
        ]}
      />
      {/* <ApplicationTable /> */}
    </div>
  );
}
