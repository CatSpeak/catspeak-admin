import { UsersRound } from "lucide-react";
// import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import Table from "../../../components/ui/table/Table";
import {
  getAccounts,
  type GetUsersParams,
  type UserSortBy,
} from "../api/getUsers";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../../../lib/utils";
import type { Account } from "../types";

export default function UsersPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<UsersRound />}
        title="Users"
        desc="View profiles, track activities, and manage access for platform's users."
        // rightButtons={[
        //   <Button variant="primary" size="sm">
        //     <Download className="w-4 h-4 mr-1" />
        //     Download
        //   </Button>,
        //   <Button variant="primary" size="sm">
        //     History export
        //   </Button>,
        // ]}
      />

      <Table<Account>
        fetcher={async (page, pageSize) => {
          const res = await getAccounts(page, pageSize);

          return {
            data: res.data,
            total: res.additionalData.totalCount,
          };
        }}
        sorter={async (attribute, sortOrder) => {
          let sortBy: UserSortBy | undefined = undefined;
          if (attribute === "username") sortBy = "Username";
          else if (attribute === "createDate") sortBy = "CreateDate";

          const order =
            sortOrder === "asc"
              ? "Asc"
              : sortOrder === "desc"
                ? "Desc"
                : undefined;
          const res = await getAccounts({ SortBy: sortBy, SortOrder: order });
          return res.data;
        }}
        filter={async (attribute, value) => {
          const params: GetUsersParams = {};
          if (attribute === "global" || attribute === "username") {
            params.Username = value ? String(value) : undefined;
          } else if (attribute === "email") {
            params.Email = value ? String(value) : undefined;
          } else if (attribute === "phoneNumber") {
            params.PhoneNumber = value ? String(value) : undefined;
          } else if (attribute === "country" && value) {
            params.Countries = Array.isArray(value)
              ? value.map(String)
              : [String(value)];
          } else if (attribute === "level" && value) {
            params.Levels = Array.isArray(value)
              ? value.map(String)
              : [String(value)];
          }
          const res = await getAccounts(params);
          return res.data;
        }}
        onClickRow={(r) => navigate(`/users/${r.accountId}`)}
        headers={[
          {
            name: "ID",
            accessorKey: "accountId",
          },
          {
            name: "Username",
            accessorKey: "username",
            cellClassName: "font-bold",
          },
          {
            name: "Email",
            accessorKey: "email",
            render: (r) => (
              <span className="text-primary underline">{r.email}</span>
            ),
            // cellClassName: ,
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
            name: "Level",
            accessorKey: "level",
          },
          {
            name: "Role",
            accessorKey: "roleName",
          },
          {
            name: "Last active",
            accessorKey: "lastSeen",
            render: (p) => (
              <span className="text-sm text-gray-600">
                {formatDateTime(p.lastSeen)}
              </span>
            ),
          },
        ]}
      />

      {/* <UserTable /> */}
    </div>
  );
}
