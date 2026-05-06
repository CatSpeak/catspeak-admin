import ApplicationTable from "../components/ApplicationTable";

export default function InstructorApplicationsPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Instructor Applications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage instructor profile applications.
          </p>
        </div>
      </div>

      <ApplicationTable />
    </div>
  );
}
