import { useCallback, useEffect, useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "../../../components/ui/PageHeader";
import Badge, { type BadgeType } from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { formatDateTime } from "../../../lib/utils";
import { getTeacherReports } from "../api/teacherReportsApi";
import TeacherReportDetailModal from "../components/TeacherReportDetailModal";
import type { TeacherReportListItem } from "../types";

const CATEGORY_MAP: Record<string, string> = {
  All: "Tất cả lý do",
  InappropriateVideo: "Video không phù hợp / phản cảm",
  MisleadingProfile: "Hồ sơ / Bằng cấp sai lệch",
  OffensiveBehavior: "Hành vi xúc phạm / thiếu chuẩn mực",
  Other: "Lý do khác",
};

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "All", label: "Tất cả" },
  { value: "Pending", label: "Chờ xử lý" },
  { value: "Warned", label: "Đã cảnh cáo" },
  { value: "Resolved", label: "Đã giải quyết" },
  { value: "Dismissed", label: "Đã bác bỏ" },
];

const STATUS_BADGES: Record<string, { label: string; type: BadgeType }> = {
  Pending: { label: "Chờ xử lý", type: "Yellow" },
  Warned: { label: "Đã cảnh cáo", type: "Orange" },
  Resolved: { label: "Đã giải quyết", type: "Green" },
  Dismissed: { label: "Đã bác bỏ", type: "Gray" },
};

export default function TeacherReportsPage() {
  const [reports, setReports] = useState<TeacherReportListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getTeacherReports({
        page,
        pageSize,
        status: statusFilter,
        category: categoryFilter,
      });
      setReports(response.items || []);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Failed to fetch teacher reports:", error);
      setReports([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Client-side search keyword filtering over teacher/reporter names
  const filteredReports = reports.filter((item) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.toLowerCase();
    const teacherName = (item.teacherFullName || item.teacherUsername || "").toLowerCase();
    const teacherEmail = (item.teacherEmail || "").toLowerCase();
    const reporterName = (item.reporterFullName || item.reporterUsername || "").toLowerCase();
    const reporterEmail = (item.reporterEmail || "").toLowerCase();
    return (
      teacherName.includes(kw) ||
      teacherEmail.includes(kw) ||
      reporterName.includes(kw) ||
      reporterEmail.includes(kw) ||
      String(item.reportId) === kw
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handleOpenDetail = (id: number) => {
    setSelectedReportId(id);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<ShieldAlert className="w-5 h-5 text-red-600" />}
        title="Báo cáo Giảng viên"
        desc="Kiểm duyệt và xử lý các phản ánh, vi phạm tiêu chuẩn cộng đồng của giảng viên theo quy trình 2 bước."
      />

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-gray-100 pb-3">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-red-50 text-primary border border-red-200 shadow-2xs"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên giáo viên, học viên hoặc ID..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-gray-800"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none text-gray-700 cursor-pointer"
              >
                {Object.entries(CATEGORY_MAP).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReports()}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Làm mới
            </Button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-600">
            <thead className="bg-gray-50/80 text-[11px] uppercase font-bold text-gray-400 border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">#ID</th>
                <th className="py-3 px-4">Giảng viên bị báo cáo</th>
                <th className="py-3 px-4">Người gửi phản ánh</th>
                <th className="py-3 px-4">Lý do vi phạm</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày gửi</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Đang tải danh sách báo cáo...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    Không tìm thấy báo cáo nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredReports.map((item) => {
                  const badge = STATUS_BADGES[item.status] || {
                    label: item.status,
                    type: "Gray" as BadgeType,
                  };
                  return (
                    <tr
                      key={item.reportId}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        #{item.reportId}
                      </td>

                      {/* Teacher */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              item.teacherAvatarUrl ||
                              "https://ui-avatars.com/api/?name=" +
                                encodeURIComponent(
                                  item.teacherFullName ||
                                    item.teacherUsername ||
                                    "Teacher"
                                )
                            }
                            alt="Teacher"
                            className="w-8 h-8 rounded-full object-cover border border-gray-100"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-xs">
                              {item.teacherFullName || item.teacherUsername || "Giảng viên"}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                              {item.teacherEmail || `ID: #${item.teacherAccountId}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Reporter */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-gray-800 text-xs">
                            {item.reporterFullName || item.reporterUsername || "Học viên"}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                            {item.reporterEmail || `ID: #${item.reporterId}`}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                          {CATEGORY_MAP[item.category] || item.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <Badge type={badge.type} showDot>
                          {badge.label}
                        </Badge>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDateTime(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(item.reportId)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Xem chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Hiển thị <strong>{filteredReports.length}</strong> trên tổng số{" "}
            <strong>{totalCount}</strong> báo cáo
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail & Action Modal */}
      <TeacherReportDetailModal
        reportId={selectedReportId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReportId(null);
        }}
        onSuccess={() => {
          fetchReports();
        }}
      />
    </div>
  );
}
