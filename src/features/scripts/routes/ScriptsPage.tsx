import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  CheckCircle2,
  Trash2,
  ShieldAlert,
  Edit,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import Breadcrumb from "../../../components/ui/Breadcrumb";
import Badge from "../../../components/ui/Badge";
import { FlagBadge } from "../../../components/ui/FlagBadge";
import {
  getScripts,
  deleteScripts,
  updateScriptsStatus,
} from "../api/scriptApi";
import { useToastStore } from "../../../stores/toastStore";
import { useLanguage } from "../../../stores/languageStore";
import type { Script, ScriptStatus, LanguageType } from "../api/types";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import Table from "../../../components/ui/table/Table";
import ScriptActionsCell from "../components/ScriptActionsCell";
import ScriptPreviewModal from "../components/ScriptPreviewModal";
import { formatDateTime } from "../../../lib/utils";

export default function ScriptsPage() {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const { t } = useLanguage();

  // Filters & Pagination State
  const [keyword, setKeyword] = useState("");
  const [community, setCommunity] = useState<LanguageType | "All">("All");
  const [status, setStatus] = useState<ScriptStatus | "All">("All");

  // Selection & Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Delete Modal
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview Modal
  const [previewScript, setPreviewScript] = useState<Script | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const fetcher = useCallback(
    async (page: number, pageSize: number) => {
      try {
        const res = await getScripts({
          searchKeyword: keyword,
          community,
          status,
          pageNumber: page,
          pageSize,
        });
        setSelectedIds([]);
        return {
          data: res.data,
          total: res.additionalData?.totalCount ?? res.totalRecords ?? 0,
        };
      } catch (err) {
        addToast(
          "error",
          t.scripts?.loadError || "Không thể tải danh sách script.",
        );
        return { data: [], total: 0 };
      }
    },
    [keyword, community, status, refreshKey, addToast],
  );

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const confirmDelete = async () => {
    if (deleteIds.length === 0) return;
    setIsDeleting(true);
    try {
      await deleteScripts(deleteIds);
      addToast(
        "success",
        (t.scripts?.deleteSuccess || "Đã xóa {count} script.").replace(
          "{count}",
          deleteIds.length.toString(),
        ),
      );
      setDeleteIds([]);
      setRefreshKey((prev) => prev + 1);
      setSelectedIds([]);
    } catch (err) {
      addToast("error", t.scripts?.deleteError || "Không thể xóa script.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkStatus = useCallback(async (
    newStatus: ScriptStatus,
    ids: number[] = selectedIds,
  ) => {
    if (ids.length === 0) return;
    try {
      await updateScriptsStatus(ids, newStatus);
      addToast(
        "success",
        (
          t.scripts?.statusUpdateSuccess ||
          "Đã cập nhật trạng thái {count} script."
        ).replace("{count}", ids.length.toString()),
      );
      setRefreshKey((prev) => prev + 1);
      setSelectedIds([]);
    } catch (err) {
      addToast(
        "error",
        t.scripts?.statusUpdateError || "Không thể cập nhật trạng thái.",
      );
    }
  }, [selectedIds, addToast, t]);

  const resetFilters = () => {
    setKeyword("");
    setCommunity("All");
    setStatus("All");
    setRefreshKey((prev) => prev + 1);
  };

  const headers = useMemo(
    () => [
      {
        name: "",
        accessorKey: "id",
        width: 48,
        headerClassName: "w-12 px-4 border-r-0",
        cellClassName: "w-12 px-4 border-r-0",
        render: (s: Script) => (
          <input
            type="checkbox"
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
            checked={selectedIds.includes(s.id)}
            onChange={(e) => handleSelectOne(s.id, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      {
        name: t.scripts?.colTitle || "Tiêu đề Script",
        accessorKey: "title",
        render: (s: Script) => (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                {s.title}
              </span>
            </div>
            <div className="text-sm text-gray-500 line-clamp-2 max-w-md">
              {s.content}
            </div>
          </div>
        ),
      },
      {
        name: t.scripts?.colCommunity || "Cộng đồng",
        accessorKey: "community",
        render: (s: Script) => (
          <div className="flex flex-wrap gap-1">
            {s.communities && s.communities.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <FlagBadge
                  languageType={s.communities[0]}
                  variant="default"
                  showLabel={true}
                />
                {s.communities.length > 1 && (
                  <span
                    className="inline-flex w-fit items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 cursor-help"
                    title={s.communities.slice(1).join(", ")}
                  >
                    +{s.communities.length - 1} {t.common?.others || "khác"}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        ),
      },
      {
        name: t.scripts?.colHighlights || "Từ khóa",
        accessorKey: "highlights",
        render: (s: Script) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-primary font-semibold bg-red-50 px-2 py-1 rounded-md w-fit whitespace-nowrap">
              {s.highlights?.length || 0}{" "}
              {t.scripts?.highlightsCount
                ? t.scripts?.highlightsCount.replace("{count}", "")
                : "từ khóa"}
            </span>
          </div>
        ),
      },
      {
        name: t.scripts?.colStatus || "Trạng thái",
        accessorKey: "status",
        render: (s: Script) =>
          s.status === "Published" ? (
            <Badge
              type="Green"
              title={t.scripts?.badgePublished || "● Xuất bản"}
            />
          ) : (
            <Badge type="Gray" title={t.scripts?.badgeDraft || "● Bản nháp"} />
          ),
      },
      {
        name: t.scripts?.colCreatedAt || "Ngày tạo",
        accessorKey: "createdAt",
        render: (s: Script) => (
          <span className="whitespace-nowrap">
            {formatDateTime(s.createdAt)}
          </span>
        ),
      },
      {
        name: t.scripts?.colActions || "Thao tác",
        accessorKey: "actions",
        pinned: "right" as const,
        width: 120,
        headerClassName: "w-[120px] text-center px-4 whitespace-nowrap",
        cellClassName: "w-[120px] text-center px-4",
        render: (s: Script) => {
          return (
            <ScriptActionsCell
              s={s}
              navigate={navigate}
              handleBulkStatus={handleBulkStatus}
              setDeleteIds={setDeleteIds}
              onPreview={setPreviewScript}
            />
          );
        },
      },
    ],
    [selectedIds, navigate, handleBulkStatus, t],
  );

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Cat Speak", href: "/" },
          { label: t.scripts?.breadcrumb || "Script" },
        ]}
      />

      <PageHeader
        icon={<ShieldAlert />}
        title={t.scripts?.title || "Script tương tác"}
        desc={
          t.scripts?.desc ||
          "Quản lý bài đọc tương tác, từ khóa học thuật và tài liệu luyện đọc cho học viên trên toàn hệ thống"
        }
        rightButtons={[
          <Button
            key="create"
            variant="primary"
            onClick={() => navigate("/scripts/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.scripts?.createBtn || "Tạo script mới"}
          </Button>,
        ]}
      />

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-[#fdf2f2] border border-red-100 rounded-xl p-4 flex flex-col gap-4 animate-[fadeIn_150ms_ease-out]">
          <div className="flex items-center gap-3">
            <div className="bg-[#910b09] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
              {selectedIds.length}
            </div>
            <span className="font-bold text-gray-900">
              {(
                t.scripts?.selectedCount || "Đã chọn {count} script tương tác"
              ).replace("{count}", selectedIds.length.toString())}
            </span>
            <span className="text-gray-300 font-light text-lg">|</span>
            <span className="text-gray-500 text-sm">
              {t.scripts?.applyToAll ||
                "Áp dụng hành động cho tất cả mục đã đánh dấu:"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="bg-white !text-[#059669] !border-[#10b981] hover:bg-green-50 px-4 py-2 rounded-lg font-medium"
              onClick={() => handleBulkStatus("Published")}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />{" "}
              {t.scripts?.publishBulk || "Xuất bản hàng loạt"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white !text-gray-700 !border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium"
              onClick={() => handleBulkStatus("Draft")}
            >
              <Edit className="w-4 h-4 mr-2" />{" "}
              {t.scripts?.draftBulk || "Chuyển về Nháp"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white !text-[#dc2626] !border-[#fca5a5] hover:bg-red-50 px-4 py-2 rounded-lg font-medium"
              onClick={() => setDeleteIds(selectedIds)}
            >
              <Trash2 className="w-4 h-4 mr-2" />{" "}
              {t.scripts?.deleteSelected || "Xóa đã chọn"}
            </Button>
            <button
              className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 ml-1 font-medium"
              onClick={() => setSelectedIds([])}
            >
              {t.scripts?.deselect || "Bỏ chọn"}
            </button>
          </div>
        </div>
      )}

      {/* Manual Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 bg-white border-b border-gray-200">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder={
                t.scripts?.searchPlaceholder ||
                "Tìm theo tiêu đề script hoặc từ khóa..."
              }
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setRefreshKey((prev) => prev + 1);
                }
              }}
            />
          </div>

          <div className="relative w-full sm:w-52">
            <select
              className="block w-full appearance-none rounded-full border border-gray-300 py-2 pl-4 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              value={community}
              onChange={(e) => {
                setCommunity(e.target.value as LanguageType | "All");
                setRefreshKey((prev) => prev + 1);
              }}
            >
              <option value="All">
                {t.scripts?.communityAll || "Cộng đồng: Tất cả"}
              </option>
              <option value="English">English</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
            </select>

            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m5 7.5 5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>

          <div className="relative w-full sm:w-52">
            <select
              className="block w-full appearance-none rounded-full border border-gray-300 py-2 pl-4 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as ScriptStatus | "All");
                setRefreshKey((prev) => prev + 1);
              }}
            >
              <option value="All">
                {t.scripts?.statusAll || "Trạng thái: Tất cả"}
              </option>
              <option value="Published">
                {t.scripts?.published || "Đã xuất bản"}
              </option>
              <option value="Draft">{t.scripts?.draft || "Bản nháp"}</option>
            </select>

            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m5 7.5 5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>

          <Button
            variant="outline"
            onClick={resetFilters}
            className="rounded-lg px-3 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table<Script>
          entityName="script"
          fetcher={fetcher}
          showGlobalSearch={false}
          onClickRow={(s) => navigate(`/scripts/${s.id}`)}
          headers={headers}
        />
      </div>

      <ConfirmModal
        isOpen={deleteIds.length > 0}
        onClose={() => setDeleteIds([])}
        onConfirm={confirmDelete}
        title="Xóa script"
        description={`Xóa ${deleteIds.length} script? Hành động này không thể hoàn tác.`}
        isLoading={isDeleting}
      />

      <ScriptPreviewModal
        script={previewScript}
        onClose={() => setPreviewScript(null)}
      />
    </div>
  );
}
