import StaffTable from "../components/StaffTable";
import { IdCardLanyard } from "lucide-react";
import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";

export default function StaffsPage() {
  return (
    <div>
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
      <StaffTable />
    </div>
  );
}
