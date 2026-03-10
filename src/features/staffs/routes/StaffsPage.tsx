import StaffTable from "../components/StaffTable";
import { RotateCcw } from "lucide-react";
import Button from "../../../components/ui/Button";

export default function StaffsPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">List of Staffs</h1>

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
            Import
          </Button>

          <Button variant="primary" size="sm">
            Decentralize
          </Button>

          <Button variant="primary" size="sm">
            History
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <StaffTable />
    </div>
  );
}
