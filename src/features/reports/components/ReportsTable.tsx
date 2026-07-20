import { useNavigate } from "react-router-dom";
import Table from "../../../components/ui/table/Table";
import { getLetterReports, type LetterReport } from "../api/letterReports";
import { LANGUAGE_FLAGS } from "../../room/constants";
import type { LanguageType } from "../../room/types";

export default function ReportsTable() {
  const navigate = useNavigate();

  return (
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
      onClickRow={(r) => navigate(`/reports/${r.storyId}`)}
      headers={[
        {
          name: "ID",
          accessorKey: "storyId",
          render: (r) => (
            <span className="font-semibold text-gray-900">#{r.storyId}</span>
          ),
        },
        {
          name: "Author",
          accessorKey: "username",
          render: (r) => (
            <span className="font-medium text-gray-700">
              {r.username || "—"}
            </span>
          ),
        },
        {
          name: "Content",
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
          name: "Language",
          accessorKey: "languageCommunity",
          render: (r) => (
            <span className="inline-block px-2 py-0.5 text-xs rounded bg-primary/10 text-primary font-medium">
              {r.languageCommunity || "—"}
            </span>
          ),
        },
        {
          name: "Language",
          accessorKey: "languageCommunity",
          render: (r) => {
            const lang = r.languageCommunity as LanguageType;

            if (!lang)
              return (
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-primary/10 text-primary font-medium">
                  —
                </span>
              );

            const flag = LANGUAGE_FLAGS[lang];

            if (!flag) return <>{lang}</>;
            else
              return (
                <span className="inline-flex items-center gap-1.5">
                  <img
                    src={flag}
                    alt={lang}
                    className="w-4 h-3.5 rounded-sm shadow-sm object-cover"
                  />
                  <span>{lang}</span>
                </span>
              );
          },
        },
      ]}
    />
  );
}
