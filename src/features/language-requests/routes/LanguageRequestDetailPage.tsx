import { useParams, useNavigate } from "react-router-dom";
import { useLanguageRequestDetail } from "../hooks/useLanguageRequestDetail";
import LanguageRequestDetailPanel from "../components/LanguageRequestDetailPanel";
import { useLanguage } from "../../../stores/languageStore";

export default function LanguageRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { request, loading, error, refetch } = useLanguageRequestDetail(id);
  const { t } = useLanguage();

  if (loading && !request) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span>{t.languageRequests.loadingRequest}</span>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">
            {error ?? t.languageRequests.requestNotFound}
          </p>
          <button
            onClick={() => navigate("/language-requests")}
            className="text-sm text-primary underline hover:opacity-80 transition-opacity cursor-pointer"
          >
            {t.languageRequests.backToRequests}
          </button>
        </div>
      </div>
    );
  }

  return (
    <LanguageRequestDetailPanel request={request} onReviewed={refetch} />
  );
}
