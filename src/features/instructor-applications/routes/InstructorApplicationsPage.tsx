import { IdCardLanyard } from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import ApplicationTable from "../components/ApplicationTable";

export default function InstructorApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<IdCardLanyard />}
        title="Instructor Applications"
        desc="Review and manage instructor profile applications."
      />
      <ApplicationTable />
    </div>
  );
}
