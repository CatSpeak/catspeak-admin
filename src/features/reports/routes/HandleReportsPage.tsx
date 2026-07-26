import { useState } from "react";
import ReportsSummaryCards from "../components/ReportsSummaryCards";
import ReportDialog from "../components/ReportDialog";
import { LANGUAGE_FLAGS } from "../../room/constants";
import type { LanguageType } from "../../room/types";
import Table from "../../../components/ui/table/Table";
import {
  getLetterReports,
  type LetterReport,
  type LetterReportSortBy,
  type GetLetterReportsParams,
} from "../api/letterReports";
import { PageHeader } from "../../../components/ui/PageHeader";
import { FileText } from "lucide-react";
import { useLanguage } from "../../../stores/languageStore";
import FlagBadge, {
  type FlagBadgeLanguage,
} from "../../../components/ui/FlagBadge";

export default function HandleReportsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<FileText />}
        title={t.reports.letterReportsTitle}
        desc={t.reports.letterReportsDesc}
      />

      <ReportsSummaryCards />

      {/* Reports Table */}
      <Table<LetterReport>
        fetcher={async (page = 1, pageSize = 10) => {
          try {
            const response = await getLetterReports(page, pageSize);
            return {
              data: response.data || [],
              total: response.total_records || 0,
            };
          } catch (error) {
            console.error("Error fetching letter reports:", error);
            return {
              data: [],
              total: 0,
            };
          }
        }}
        sorter={async (attribute, sortOrder) => {
          let sortBy: LetterReportSortBy | undefined = undefined;
          if (attribute === "storyContent") sortBy = "Content";
          else if (attribute === "username") sortBy = "AuthorUsername";
          else if (attribute === "createDate") sortBy = "CreateDate";
          else if (attribute === "status") sortBy = "Status";

          const order =
            sortOrder === "asc"
              ? "Asc"
              : sortOrder === "desc"
                ? "Desc"
                : undefined;
          const res = await getLetterReports({
            SortBy: sortBy,
            SortOrder: order,
          });
          return res.data || [];
        }}
        filter={async (attribute, value) => {
          const params: GetLetterReportsParams = {};
          if (attribute === "global" || attribute === "storyContent") {
            params.Content = value ? String(value) : undefined;
          } else if (attribute === "username") {
            params.AuthorUsername = value ? String(value) : undefined;
          } else if (attribute === "languageCommunity" && value) {
            params.LanguageCommunities = Array.isArray(value)
              ? value.map(String)
              : [String(value)];
          }
          const res = await getLetterReports(params);
          return res.data || [];
        }}
        onClickRow={(r) => setSelectedId(r.storyId)}
        headers={[
          {
            name: t.users.id,
            accessorKey: "storyId",
            render: (r) => (
              <span className="font-semibold text-gray-900">#{r.storyId}</span>
            ),
          },
          {
            name: t.news.author,
            accessorKey: "username",
            render: (r) => (
              <span className="font-medium text-gray-700">
                {r.username || "—"}
              </span>
            ),
          },
          {
            name: t.news.preview,
            accessorKey: "storyContent",
            render: (r) => (
              <p
                className="text-sm text-gray-650 max-w-md truncate"
                title={r.storyContent}
              >
                {r.storyContent}
              </p>
            ),
          },
          {
            name: t.header.language,
            accessorKey: "languageCommunity",
            render: (p) => <FlagBadge languageType={p.languageCommunity} />,
          },
        ]}
      />

      {selectedId && (
        <ReportDialog
          id={selectedId}
          onClose={() => setSelectedId(null)}
          onDeleteSuccess={() => {
            setSelectedId(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
