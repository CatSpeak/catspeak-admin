import { IdCardLanyard } from "lucide-react";
import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import Table from "../../../components/ui/table/Table";
import { getStaffs } from "../api/getStaffs";
import { useNavigate } from "react-router-dom";
import type { Account } from "../types";
import { formatDateTime } from "../../../lib/utils";

export default function StaffsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<IdCardLanyard />}
        title="Staffs"
        desc="Manage your core team and streamline internal permissions."
        rightButtons={[
          <Button variant="primary" size="sm">
            Import
          </Button>,
          <Button variant="primary" size="sm">
            Decentralize
          </Button>,
          <Button variant="primary" size="sm">
            History
          </Button>,
        ]}
      />

      {/* Staff Table */}
      <Table<Account>
        fetcher={async (page, pageSize) => {
          const res = await getStaffs(page, pageSize);
          return {
            data: res.data,
            total: res.additionalData.totalCount,
          };
        }}
        onClickRow={(r) => navigate(`/staffs/${r.accountId}`)}
        headers={[
          {
            name: "ID",
            accessorKey: "accountId",
          },
          {
            name: "Name",
            accessorKey: "username",
            cellClassName: "font-bold",
          },
          {
            name: "Email",
            accessorKey: "email",
            render: (r) => (
              <span className="text-primary underline">{r.email}</span>
            ),
          },
          {
            name: "Phone",
            accessorKey: "phoneNumber",
            render: (r) => (
              <span className="whitespace-nowrap">{r.phoneNumber || "—"}</span>
            ),
          },
          {
            name: "Date joined",
            accessorKey: "createDate",
            render: (p) => (
              <span className="text-sm text-gray-600">
                {formatDateTime(p.createDate)}
              </span>
            ),
          },
          {
            name: "Country",
            accessorKey: "country",
          },
          {
            name: "Community",
            accessorKey: "roleName",
          },
          {
            name: "Visit duration",
            accessorKey: "visitDurationForStaff",
          },
        ]}
      />
      {/* <StaffTable /> */}
    </div>
  );
}
