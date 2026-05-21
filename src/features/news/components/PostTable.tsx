import { Pencil, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Post } from "../types";
import DataTable, { type Column } from "../../../components/ui/DataTable";
import { formatDate } from "../../../lib/utils";

interface PostTableProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasNextPage: boolean;
  goToPage: (page: number) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

function stripHtmlAndTruncate(html: string, maxLength: number = 80) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

function getColumns(
  onEdit: (post: Post) => void,
  onDelete: (post: Post) => void,
): Column<Post>[] {
  return [
    {
      header: "ID",
      render: (p) => <span className="font-medium text-gray-900">{p.postId}</span>,
    },
    {
      header: "Author",
      render: (p) => (
        <div className="flex items-center gap-2">
          <img src={p.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
          <span className="text-gray-700">{p.authorName}</span>
        </div>
      ),
    },
    {
      header: "Content Preview",
      render: (p) => (
        <span
          className="text-gray-600 max-w-xs truncate block"
          title={stripHtmlAndTruncate(p.content, 200)}
        >
          {stripHtmlAndTruncate(p.content)}
        </span>
      ),
    },
    {
      header: "Media",
      render: (p) =>
        p.media?.length ? (
          <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded w-max">
            <ImageIcon size={14} /> {p.media.length}
          </div>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      header: "Privacy",
      render: (p) => (
        <span
          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize whitespace-nowrap ${
            p.privacy === "Public"
              ? "bg-green-50 text-green-600 border border-green-200"
              : p.privacy === "Private"
                ? "bg-red-50 text-red-500 border border-red-200"
                : "bg-amber-50 text-amber-600 border border-amber-200"
          }`}
        >
          {typeof p.privacy === "string"
            ? p.privacy.replace(/([A-Z])/g, " $1").trim()
            : String(p.privacy || "Unknown")}
        </span>
      ),
    },
    {
      header: "Reactions",
      render: (p) => <span className="text-center block">{p.totalReactions}</span>,
    },
    {
      header: "Date Created",
      render: (p) => <span className="whitespace-nowrap">{formatDate(p.createDate)}</span>,
    },
    {
      header: "Last Edited",
      render: (p) => <span className="whitespace-nowrap">{formatDate(p.lastEdited)}</span>,
    },
    {
      header: "Actions",
      render: (p) => (
        <div className="flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="p-1.5 hover:bg-gray-200 hover:text-primary rounded transition-colors text-gray-500"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(p);
            }}
            title="Edit Post"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded transition-colors text-gray-500"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(p);
            }}
            title="Delete Post"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];
}

export default function PostTable({
  posts,
  loading,
  error,
  currentPage,
  hasNextPage,
  goToPage,
  onEdit,
  onDelete,
}: PostTableProps) {
  const navigate = useNavigate();
  const columns = getColumns(onEdit, onDelete);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={posts}
        keyExtractor={(p) => p.postId}
        loading={loading}
        loadingMessage="Loading posts..."
        emptyMessage="No posts found"
        error={error}
        onRowClick={(p) => navigate(`/news/${p.postId}`)}
      />

      {/* Simple prev/next pagination (PostTable uses a different API that doesn't expose total count) */}
      {(posts.length > 0 || currentPage > 1) && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 rounded-lg bg-orange-50 border border-orange-100 gap-4">
          <span className="text-sm text-gray-600">Showing page {currentPage}</span>

          <div className="flex items-center gap-3">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded transition-colors disabled:opacity-40 text-primary hover:bg-primary/10 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-medium text-primary">{currentPage}</span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!hasNextPage}
              className="p-1.5 rounded transition-colors disabled:opacity-40 text-primary hover:bg-primary/10 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
