import { useParams, useNavigate } from "react-router-dom";
import { useInstructorApplicationDetail } from "../hooks/useInstructorApplicationDetail";
import ApplicationDetailPanel from "../components/ApplicationDetailPanel";

export default function InstructorApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { application, loading, error } = useInstructorApplicationDetail(id);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span>Loading application...</span>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">{error ?? "Application not found."}</p>
          <button
            onClick={() => navigate("/instructor-applications")}
            className="text-sm text-primary underline hover:opacity-80 transition-opacity"
          >
            Back to applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <ApplicationDetailPanel
      application={application}
      onReviewed={() => navigate("/instructor-applications")}
    />
  );
}
