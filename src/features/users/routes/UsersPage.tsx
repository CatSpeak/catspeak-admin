import UserTable from "../components/UserTable";
import { Download, RotateCcw, UsersRound } from "lucide-react";
import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";

export default function UsersPage() {
  return (
    <div>
      {/* Page Header */}
      <PageHeader
        icon={<UsersRound />}
        title="Users"
        desc="View profiles, track activities, and manage access for platform's users."
        rightButtons={[
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Clear
          </Button>,
          <Button variant="primary" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Download,
          </Button>,
          <Button variant="primary" size="sm">
            History export
          </Button>,
        ]}
      />

      {/* User Table */}
      <UserTable />
    </div>
  );
}
