import UserTable from "./components/UserTable";
import { Download, RotateCcw } from "lucide-react";
import Button from "../../components/ui/Button";

export default function UsersPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">List of Users</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>

          <Button variant="primary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>

          <Button variant="primary" size="sm">
            History export
          </Button>
        </div>
      </div>

      {/* User Table */}
      <UserTable />
    </div>
  );
}
