import React, { useState, useEffect, useRef } from "react";
import { axiosClient } from "../../../lib/axios";
import { useLanguage } from "../../../stores/languageStore";
import {
  Send,
  Mail,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  RefreshCw,
  Upload,
  Eye,
  Code,
  XCircle,
  Trash2,
  FileText,
} from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";

interface BroadcastItem {
  id: number;
  title: string;
  subjectVi: string;
  contentVi: string;
  subjectEn?: string;
  contentEn?: string;
  subjectZh?: string;
  contentZh?: string;
  isMultiLanguage: boolean;
  targetRoleIds: number[];
  targetCountries: string[];
  importedEmailsCount: number;
  scheduledAt?: string;
  createdAt: string;
  completedAt?: string;
  status: number; // 0=Draft, 1=Scheduled, 2=Processing, 3=Completed, 4=Failed, 5=Cancelled
  statusName: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  progressPercent: number;
  createdBy: string;
}

interface BroadcastLogItem {
  id: number;
  recipientEmail: string;
  languageUsed: string;
  status: number;
  statusName: string;
  errorMessage?: string;
  sentAt?: string;
}

const BroadcastMailPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");

  // Form State
  const [title, setTitle] = useState("");
  const [isMultiLanguage, setIsMultiLanguage] = useState(false);
  const [langTab, setLangTab] = useState<"vi" | "en" | "zh">("vi");
  const [viewMode, setViewMode] = useState<"code" | "preview">("code");

  // Contents
  const [subjectVi, setSubjectVi] = useState("");
  const [contentVi, setContentVi] = useState("");
  const [subjectEn, setSubjectEn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [subjectZh, setSubjectZh] = useState("");
  const [contentZh, setContentZh] = useState("");

  // Targets
  const [targetType, setTargetType] = useState<
    "all" | "roles" | "countries" | "custom"
  >("all");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [importedEmailsStr, setImportedEmailsStr] = useState("");
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Schedule
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState("");

  // Estimator & Actions State
  const [estimatedRecipients, setEstimatedRecipients] = useState<number | null>(
    null,
  );
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Test Email Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  // History State
  const [historyItems, setHistoryItems] = useState<BroadcastItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Detailed Log Inspection Modal
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedBroadcast, setSelectedBroadcast] =
    useState<BroadcastItem | null>(null);
  const [logsList, setLogsList] = useState<BroadcastLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [logTotalPages, setLogTotalPages] = useState(1);
  const [logStatusFilter, setLogStatusFilter] = useState<string>("all");
  const [logSearch, setLogSearch] = useState("");

  // Fetch Estimate
  const handleEstimate = async () => {
    setEstimating(true);
    try {
      const importedList = importedEmailsStr
        .split(/[\n,;]/)
        .map((e) => e.trim())
        .filter((e) => e.includes("@"));

      const res = await axiosClient.post<{ estimatedCount: number }>(
        "/Admin/broadcasts/estimate",
        {
          targetRoleIds: targetType === "roles" ? selectedRoles : null,
          targetCountries:
            targetType === "countries" ? selectedCountries : null,
          importedEmails: targetType === "custom" ? importedList : null,
        },
      );

      setEstimatedRecipients(res.data.estimatedCount);
    } catch (err: any) {
      console.error("Failed to estimate recipients", err);
    } finally {
      setEstimating(false);
    }
  };

  useEffect(() => {
    if (activeTab === "compose") {
      handleEstimate();
    } else {
      fetchHistory();
    }
  }, [
    targetType,
    selectedRoles,
    selectedCountries,
    importedEmailsStr,
    activeTab,
  ]);

  // Fetch Broadcast History
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await axiosClient.get<{ items: BroadcastItem[] }>(
        "/Admin/broadcasts?page=1&pageSize=50",
      );
      setHistoryItems(res.data.items || []);
    } catch (err: any) {
      console.error("Failed to fetch broadcast history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // CSV File Upload Handler
  const handleCsvFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCsv(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axiosClient.post<{
        validEmails: string[];
        totalFound: number;
      }>("/Admin/broadcasts/parse-csv", formData, {
        headers: { "Content-Type": "multipart/form-[#8f0d15]" },
      });

      const parsedEmails = res.data.validEmails || [];
      if (parsedEmails.length > 0) {
        setImportedEmailsStr(parsedEmails.join("\n"));
        setTargetType("custom");
        alert(
          t.broadcast.csvExtractSuccess.replace(
            "{count}",
            String(parsedEmails.length),
          ),
        );
      } else {
        alert(t.broadcast.csvNoValidEmail);
      }
    } catch (err: any) {
      alert(
        t.broadcast.csvReadError + (err.response?.data?.message || err.message),
      );
    } finally {
      setUploadingCsv(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Variable Helper Button
  const insertVariable = (variableStr: string) => {
    if (langTab === "vi") setContentVi((prev) => prev + " " + variableStr);
    else if (langTab === "en") setContentEn((prev) => prev + " " + variableStr);
    else if (langTab === "zh") setContentZh((prev) => prev + " " + variableStr);
  };

  // Submit Broadcast
  const handleSubmit = async () => {
    if (!title.trim()) {
      setMessage({ type: "error", text: t.broadcast.enterCampaignTitleError });
      return;
    }
    if (!subjectVi.trim() || !contentVi.trim()) {
      setMessage({ type: "error", text: t.broadcast.enterViContentError });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const importedList = importedEmailsStr
        .split(/[\n,;]/)
        .map((e) => e.trim())
        .filter((e) => e.includes("@"));

      await axiosClient.post("/Admin/broadcasts", {
        title,
        subjectVi,
        contentVi,
        subjectEn: isMultiLanguage ? subjectEn : null,
        contentEn: isMultiLanguage ? contentEn : null,
        subjectZh: isMultiLanguage ? subjectZh : null,
        contentZh: isMultiLanguage ? contentZh : null,
        isMultiLanguage,
        targetRoleIds: targetType === "roles" ? selectedRoles : null,
        targetCountries: targetType === "countries" ? selectedCountries : null,
        importedEmails: targetType === "custom" ? importedList : null,
        scheduledAt:
          isScheduled && scheduledDateTime
            ? new Date(scheduledDateTime).toISOString()
            : null,
        sendImmediately: !isScheduled,
      });

      setMessage({ type: "success", text: t.broadcast.campaignCreatedSuccess });
      setActiveTab("history");
      fetchHistory();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || t.broadcast.campaignCreatedError,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Campaign
  const handleCancelCampaign = async (id: number) => {
    if (!window.confirm(t.broadcast.confirmCancel.replace("{id}", String(id))))
      return;

    try {
      await axiosClient.post(`/Admin/broadcasts/${id}/cancel`);
      alert(t.broadcast.cancelSuccess.replace("{id}", String(id)));
      fetchHistory();
    } catch (err: any) {
      alert(
        t.broadcast.cancelError + (err.response?.data?.message || err.message),
      );
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: number) => {
    if (!window.confirm(t.broadcast.confirmDelete.replace("{id}", String(id))))
      return;

    try {
      await axiosClient.delete(`/Admin/broadcasts/${id}`);
      fetchHistory();
    } catch (err: any) {
      alert(
        t.broadcast.deleteError + (err.response?.data?.message || err.message),
      );
    }
  };

  // Open Log Modal & Fetch Logs
  const handleOpenLogs = async (broadcast: BroadcastItem) => {
    setSelectedBroadcast(broadcast);
    setLogModalOpen(true);
    setLogPage(1);
    fetchBroadcastLogs(broadcast.id, 1, logStatusFilter, logSearch);
  };

  const fetchBroadcastLogs = async (
    broadcastId: number,
    page: number,
    statusFilter: string,
    search: string,
  ) => {
    setLoadingLogs(true);
    try {
      let url = `/Admin/broadcasts/${broadcastId}/logs?page=${page}&pageSize=30`;
      if (statusFilter !== "all") url += `&statusFilter=${statusFilter}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await axiosClient.get<{
        items: BroadcastLogItem[];
        totalPages: number;
      }>(url);
      setLogsList(res.data.items || []);
      setLogTotalPages(res.data.totalPages || 1);
    } catch (err: any) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      alert(t.broadcast.invalidEmailError);
      return;
    }

    setSendingTest(true);
    try {
      let subj = subjectVi;
      let body = contentVi;
      if (langTab === "en" && subjectEn) {
        subj = subjectEn;
        body = contentEn;
      } else if (langTab === "zh" && subjectZh) {
        subj = subjectZh;
        body = contentZh;
      }

      await axiosClient.post("/Admin/broadcasts/test", {
        targetEmail: testEmail,
        subject: subj || "Test Mail CatSpeak",
        contentHtml: body || "<p>Nội dung thử nghiệm</p>",
        language: langTab,
      });

      alert(t.broadcast.testEmailSentSuccess.replace("{email}", testEmail));
      setTestModalOpen(false);
    } catch (err: any) {
      alert(
        t.broadcast.testEmailSentError +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setSendingTest(false);
    }
  };

  // Get active HTML content for preview
  const getActiveContentHtml = () => {
    let body = contentVi;
    if (langTab === "en" && contentEn) body = contentEn;
    if (langTab === "zh" && contentZh) body = contentZh;
    return (
      body ||
      `<p style='color: #888; text-align: center;'>${t.broadcast.noPreviewContent}</p>`
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <PageHeader
          icon={<Mail />}
          title={t.broadcast.title}
          desc={t.broadcast.desc}
          rightButtons={[
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <Button
                size="sm"
                onClick={() => setActiveTab("compose")}
                className={`font-semibold rounded-lg transition-all ${
                  activeTab === "compose"
                    ? "bg-white text-[#8f0d15] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.broadcast.composeNewMail}
              </Button>
              <Button
                size="sm"
                onClick={() => setActiveTab("history")}
                className={`font-semibold rounded-lg transition-all ${
                  activeTab === "history"
                    ? "bg-white text-[#8f0d15] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t.broadcast.broadcastHistory}
              </Button>
            </div>,
          ]}
        />
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {activeTab === "compose" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form & Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Mode */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {t.broadcast.campaignTitle}
                </label>
                <input
                  type="text"
                  placeholder={t.broadcast.campaignTitlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f0d15]"
                />
              </div>

              {/* Multi-language switch */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">
                    {t.broadcast.multiLangVariants}
                  </span>
                  <span className="text-xs text-gray-500">
                    {t.broadcast.multiLangDesc}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMultiLanguage}
                    onChange={(e) => setIsMultiLanguage(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8f0d15]"></div>
                </label>
              </div>
            </div>

            {/* Content Editor Panel */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              {/* Header Controls: Lang Tabs + Mode Switch */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  {isMultiLanguage ? (
                    <>
                      <button
                        onClick={() => setLangTab("vi")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                          langTab === "vi"
                            ? "bg-[#8f0d15] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {t.broadcast.vietnamese}
                      </button>
                      <button
                        onClick={() => setLangTab("en")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                          langTab === "en"
                            ? "bg-[#8f0d15] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {t.broadcast.english}
                      </button>
                      <button
                        onClick={() => setLangTab("zh")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                          langTab === "zh"
                            ? "bg-[#8f0d15] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {t.broadcast.chinese}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {t.broadcast.singleLangTemplate}
                    </span>
                  )}
                </div>

                {/* View Code vs Preview Toggle */}
                <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode("code")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      viewMode === "code"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500"
                    } flex items-center gap-1`}
                  >
                    <Code className="w-3.5 h-3.5" /> {t.broadcast.htmlCode}
                  </button>
                  <button
                    onClick={() => setViewMode("preview")}
                    className={`px-2.5 py-1 text-xs font-semibold rounded ${
                      viewMode === "preview"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500"
                    } flex items-center gap-1`}
                  >
                    <Eye className="w-3.5 h-3.5" /> {t.broadcast.visualPreview}
                  </button>
                </div>
              </div>

              {/* Variable Quick-Insert Helpers */}
              <div className="flex items-center gap-2 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="font-semibold text-gray-600">
                  {t.broadcast.insertVariable}
                </span>
                <button
                  onClick={() => insertVariable("{{name}}")}
                  className="px-2 py-0.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded font-mono"
                >
                  {"{{name}}"}
                </button>
                <button
                  onClick={() => insertVariable("{{email}}")}
                  className="px-2 py-0.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded font-mono"
                >
                  {"{{email}}"}
                </button>
                <button
                  onClick={() => insertVariable("{{unsubscribe_url}}")}
                  className="px-2 py-0.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded font-mono"
                >
                  {"{{unsubscribe_url}}"}
                </button>
              </div>

              {/* EDITOR OR PREVIEW */}
              {viewMode === "code" ? (
                <>
                  {/* VIETNAMESE */}
                  {(langTab === "vi" || !isMultiLanguage) && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {t.broadcast.subjectVi}
                        </label>
                        <input
                          type="text"
                          placeholder={t.broadcast.subjectViPlaceholder}
                          value={subjectVi}
                          onChange={(e) => setSubjectVi(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f0d15]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {t.broadcast.contentVi}
                        </label>
                        <textarea
                          rows={10}
                          placeholder={t.broadcast.contentViPlaceholder}
                          value={contentVi}
                          onChange={(e) => setContentVi(e.target.value)}
                          className="w-full px-4 py-3 font-mono text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f0d15]"
                        />
                      </div>
                    </div>
                  )}

                  {/* ENGLISH */}
                  {isMultiLanguage && langTab === "en" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {t.broadcast.subjectEn}
                        </label>
                        <input
                          type="text"
                          placeholder={t.broadcast.subjectEnPlaceholder}
                          value={subjectEn}
                          onChange={(e) => setSubjectEn(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f0d15]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {t.broadcast.contentEn}
                        </label>
                        <textarea
                          rows={10}
                          placeholder={t.broadcast.contentEnPlaceholder}
                          value={contentEn}
                          onChange={(e) => setContentEn(e.target.value)}
                          className="w-full px-4 py-3 font-mono text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f0d15]"
                        />
                      </div>
                    </div>
                  )}

                  {/* CHINESE */}
                  {isMultiLanguage && langTab === "zh" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {t.broadcast.subjectZh}
                        </label>
                        <input
                          type="text"
                          placeholder={t.broadcast.subjectZhPlaceholder}
                          value={subjectZh}
                          onChange={(e) => setSubjectZh(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f0d15]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                          {t.broadcast.contentZh}
                        </label>
                        <textarea
                          rows={10}
                          placeholder={t.broadcast.contentZhPlaceholder}
                          value={contentZh}
                          onChange={(e) => setContentZh(e.target.value)}
                          className="w-full px-4 py-3 font-mono text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f0d15]"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* LIVE HTML VISUAL PREVIEW */
                <div className="border border-gray-200 rounded-xl p-6 bg-white min-h-[300px]">
                  <div
                    className="prose max-w-none text-gray-800 text-sm"
                    dangerouslySetInnerHTML={{ __html: getActiveContentHtml() }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Audience & Settings (1 col) */}
          <div className="space-y-6">
            {/* Target Audience */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#8f0d15]" />{" "}
                {t.broadcast.targetAudience}
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === "all"}
                    onChange={() => setTargetType("all")}
                    className="text-[#8f0d15] focus:ring-[#8f0d15]"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t.broadcast.allUsers}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === "roles"}
                    onChange={() => setTargetType("roles")}
                    className="text-[#8f0d15] focus:ring-[#8f0d15]"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t.broadcast.filterByRoles}
                  </span>
                </label>

                {targetType === "roles" && (
                  <div className="pl-6 space-y-1 text-xs">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(1)}
                        onChange={(e) =>
                          setSelectedRoles(
                            e.target.checked
                              ? [...selectedRoles, 1]
                              : selectedRoles.filter((r) => r !== 1),
                          )
                        }
                      />
                      {t.broadcast.roleUser}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(2)}
                        onChange={(e) =>
                          setSelectedRoles(
                            e.target.checked
                              ? [...selectedRoles, 2]
                              : selectedRoles.filter((r) => r !== 2),
                          )
                        }
                      />
                      {t.broadcast.roleInstructor}
                    </label>
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === "countries"}
                    onChange={() => setTargetType("countries")}
                    className="text-[#8f0d15] focus:ring-[#8f0d15]"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t.broadcast.filterByCountry}
                  </span>
                </label>

                {targetType === "countries" && (
                  <div className="pl-6 space-y-1 text-xs">
                    {[
                      "Vietnam",
                      "China",
                      "United States",
                      "Japan",
                      "Korea",
                    ].map((c) => (
                      <label key={c} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCountries.includes(c)}
                          onChange={(e) =>
                            setSelectedCountries(
                              e.target.checked
                                ? [...selectedCountries, c]
                                : selectedCountries.filter(
                                    (item) => item !== c,
                                  ),
                            )
                          }
                        />
                        {c}
                      </label>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === "custom"}
                    onChange={() => setTargetType("custom")}
                    className="text-[#8f0d15] focus:ring-[#8f0d15]"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t.broadcast.importEmailList}
                  </span>
                </label>

                {targetType === "custom" && (
                  <div className="pl-6 pt-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv,.txt,.xlsx"
                      onChange={handleCsvFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingCsv}
                      className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                    >
                      {uploadingCsv ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {t.broadcast.uploadCsvExcel}
                    </button>

                    <textarea
                      rows={4}
                      placeholder={t.broadcast.emailsPlaceholder}
                      value={importedEmailsStr}
                      onChange={(e) => setImportedEmailsStr(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-gray-200 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Estimate Box */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">
                    {t.broadcast.estimatedRecipients}
                  </span>
                  <span className="text-xl font-extrabold text-[#8f0d15]">
                    {estimating
                      ? "..."
                      : estimatedRecipients !== null
                        ? t.broadcast.recipientsCount.replace(
                            "{count}",
                            estimatedRecipients.toLocaleString(),
                          )
                        : "N/A"}
                  </span>
                </div>
                <button
                  onClick={handleEstimate}
                  disabled={estimating}
                  className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${estimating ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            {/* Schedule & Trigger Actions */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#8f0d15]" />{" "}
                {t.broadcast.scheduleAndSend}
              </h3>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="text-[#8f0d15] focus:ring-[#8f0d15]"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t.broadcast.scheduleLater}
                  </span>
                </label>

                {isScheduled && (
                  <input
                    type="datetime-local"
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none"
                  />
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 space-y-2">
                {/* Send Test Email Button */}
                <button
                  onClick={() => setTestModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#8f0d15]" />{" "}
                  {t.broadcast.sendTestEmail}
                </button>

                {/* Submit Broadcast Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-3 px-4 bg-[#8f0d15] hover:bg-[#730a11] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      {t.broadcast.initializing}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />{" "}
                      {isScheduled
                        ? t.broadcast.confirmScheduleSend
                        : t.broadcast.startBroadcastNow}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t.broadcast.historyTitle}
              </h2>
              <p className="text-xs text-gray-500">{t.broadcast.historyDesc}</p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={loadingHistory}
              className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingHistory ? "animate-spin" : ""}`}
              />{" "}
              {t.broadcast.refresh}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold text-xs border-b border-gray-100">
                <tr>
                  <th className="p-4">{t.broadcast.tableId}</th>
                  <th className="p-4">{t.broadcast.tableCampaign}</th>
                  <th className="p-4">{t.broadcast.tableMode}</th>
                  <th className="p-4">{t.broadcast.tableStatus}</th>
                  <th className="p-4">{t.broadcast.tableProgress}</th>
                  <th className="p-4">{t.broadcast.tableSuccessFailed}</th>
                  <th className="p-4">{t.broadcast.tableCreatedAt}</th>
                  <th className="p-4 text-right">{t.broadcast.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {historyItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      {t.broadcast.noCampaignsFound}
                    </td>
                  </tr>
                ) : (
                  historyItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/60 transition-all"
                    >
                      <td className="p-4 font-mono font-bold text-xs text-gray-500">
                        #{item.id}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {item.title}
                        <span className="block text-xs font-normal text-gray-500 truncate max-w-xs">
                          {item.subjectVi}
                        </span>
                      </td>
                      <td className="p-4">
                        {item.isMultiLanguage ? (
                          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-purple-100 text-purple-700 rounded-full">
                            {t.broadcast.multiLingualTag}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-100 text-blue-700 rounded-full">
                            {t.broadcast.singleLanguageTag}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                            item.status === 3
                              ? "bg-green-100 text-green-700"
                              : item.status === 2
                                ? "bg-yellow-100 text-yellow-800 animate-pulse"
                                : item.status === 1
                                  ? "bg-blue-100 text-blue-700"
                                  : item.status === 5
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.statusName}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{item.progressPercent}%</span>
                            <span className="text-gray-400">
                              {item.sentCount}/{item.totalRecipients}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#8f0d15] h-full transition-all duration-500"
                              style={{ width: `${item.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium">
                        <span className="text-green-600 font-bold">
                          {item.sentCount} OK
                        </span>{" "}
                        /{" "}
                        <span className="text-red-500 font-bold">
                          {item.failedCount} Fail
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenLogs(item)}
                          className="p-1.5 text-gray-600 hover:text-[#8f0d15] hover:bg-gray-100 rounded-lg"
                          title={t.broadcast.viewLogsTooltip}
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {(item.status === 1 || item.status === 2) && (
                          <button
                            onClick={() => handleCancelCampaign(item.id)}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                            title={t.broadcast.cancelCampaignTooltip}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {item.status !== 2 && (
                          <button
                            onClick={() => handleDeleteCampaign(item.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title={t.broadcast.deleteCampaignTooltip}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recipient Log Inspection Modal */}
      {logModalOpen && selectedBroadcast && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full space-y-4 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t.broadcast.logModalTitle
                    .replace("{id}", String(selectedBroadcast.id))
                    .replace("{title}", selectedBroadcast.title)}
                </h3>
                <p className="text-xs text-gray-500">
                  {t.broadcast.logModalStats
                    .replace(
                      "{total}",
                      String(selectedBroadcast.totalRecipients),
                    )
                    .replace("{sent}", String(selectedBroadcast.sentCount))
                    .replace("{failed}", String(selectedBroadcast.failedCount))}
                </p>
              </div>
              <button
                onClick={() => setLogModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-600">
                  {t.broadcast.statusLabel}
                </span>
                <select
                  value={logStatusFilter}
                  onChange={(e) => {
                    setLogStatusFilter(e.target.value);
                    fetchBroadcastLogs(
                      selectedBroadcast.id,
                      1,
                      e.target.value,
                      logSearch,
                    );
                  }}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
                >
                  <option value="all">{t.broadcast.allStatus}</option>
                  <option value="1">{t.broadcast.sentStatus}</option>
                  <option value="2">{t.broadcast.failedStatus}</option>
                  <option value="0">{t.broadcast.pendingStatus}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t.broadcast.searchEmailPlaceholder}
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      fetchBroadcastLogs(
                        selectedBroadcast.id,
                        1,
                        logStatusFilter,
                        logSearch,
                      );
                  }}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none w-48"
                />
                <button
                  onClick={() =>
                    fetchBroadcastLogs(
                      selectedBroadcast.id,
                      1,
                      logStatusFilter,
                      logSearch,
                    )
                  }
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold"
                >
                  {t.broadcast.searchBtn}
                </button>
              </div>
            </div>

            {/* Log Table */}
            <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold sticky top-0 border-b border-gray-100">
                  <tr>
                    <th className="p-3">{t.broadcast.logEmailRecipient}</th>
                    <th className="p-3">{t.broadcast.logLanguage}</th>
                    <th className="p-3">{t.broadcast.logStatus}</th>
                    <th className="p-3">{t.broadcast.logErrorDetails}</th>
                    <th className="p-3">{t.broadcast.logSentAt}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />{" "}
                        {t.broadcast.loadingLogs}
                      </td>
                    </tr>
                  ) : logsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400">
                        {t.broadcast.noLogsFound}
                      </td>
                    </tr>
                  ) : (
                    logsList.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/60">
                        <td className="p-3 font-semibold text-gray-900">
                          {log.recipientEmail}
                        </td>
                        <td className="p-3 uppercase font-mono font-bold">
                          {log.languageUsed}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 font-bold rounded-full ${
                              log.status === 1
                                ? "bg-green-100 text-green-700"
                                : log.status === 2
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {log.statusName}
                          </span>
                        </td>
                        <td className="p-3 text-red-600 font-mono text-[11px] truncate max-w-xs">
                          {log.errorMessage || "-"}
                        </td>
                        <td className="p-3 text-gray-500">
                          {log.sentAt
                            ? new Date(log.sentAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>
                {t.broadcast.logPageInfo
                  .replace("{page}", String(logPage))
                  .replace("{totalPages}", String(logTotalPages))}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={logPage <= 1}
                  onClick={() => {
                    const p = logPage - 1;
                    setLogPage(p);
                    fetchBroadcastLogs(
                      selectedBroadcast.id,
                      p,
                      logStatusFilter,
                      logSearch,
                    );
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-40 font-semibold"
                >
                  {t.broadcast.prevPage}
                </button>
                <button
                  disabled={logPage >= logTotalPages}
                  onClick={() => {
                    const p = logPage + 1;
                    setLogPage(p);
                    fetchBroadcastLogs(
                      selectedBroadcast.id,
                      p,
                      logStatusFilter,
                      logSearch,
                    );
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-40 font-semibold"
                >
                  {t.broadcast.nextPage}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">
              {t.broadcast.testModalTitle}
            </h3>
            <p className="text-xs text-gray-500">{t.broadcast.testModalDesc}</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.broadcast.testEmailLabel}
              </label>
              <input
                type="email"
                placeholder="admin@catspeak.com.vn"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8f0d15]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="px-4 py-2 text-xs font-bold bg-[#8f0d15] hover:bg-[#730a11] text-white rounded-xl flex items-center gap-1.5"
              >
                {sendingTest ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {t.broadcast.sendTestNow}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastMailPage;
