import { Pencil, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Post } from "../types";
import Card from "../../../components/ui/Card";

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

const TABLE_HEADERS = [
  "ID",
  "Author",
  "Content Preview",
  "Media",
  "Privacy",
  "Reactions",
  "Date Created",
  "Last Edited",
  "Actions"
];

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

function stripHtmlAndTruncate(html: string, maxLength: number = 80) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const text = tmp.textContent || tmp.innerText || "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

export default function PostTable({
  posts,
  loading,
  error,
  currentPage,
  hasNextPage,
  goToPage,
  onEdit,
  onDelete
}: PostTableProps) {
  const navigate = useNavigate();

  const handleRowClick = (postId: number) => {
    navigate(`/news/${postId}`);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Card noPadding className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-primary text-white">
              <tr>
                {TABLE_HEADERS.map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-sm font-bold tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-24 text-center text-sm text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span>Loading posts...</span>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No posts found
                  </td>
                </tr>
              ) : (
                posts.map((post, idx) => (
                  <tr
                    key={post.postId}
                    onClick={() => handleRowClick(post.postId)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {post.postId}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <img src={post.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-gray-700">{post.authorName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={stripHtmlAndTruncate(post.content, 200)}>
                      {stripHtmlAndTruncate(post.content)}
                    </td>
                    <td className="px-4 py-3">
                       {post.media?.length ? (
                         <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded w-max">
                           <ImageIcon size={14} /> {post.media.length}
                         </div>
                       ) : (
                         <span className="text-gray-400">—</span>
                       )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full capitalize whitespace-nowrap ${
                          post.privacy === "Public"
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : post.privacy === "Private"
                              ? "bg-red-50 text-red-500 border border-red-200"
                              : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}
                      >
                        {typeof post.privacy === 'string' ? post.privacy.replace(/([A-Z])/g, " $1").trim() : String(post.privacy || "Unknown")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 text-center">
                      {post.totalReactions}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(post.createDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatDate(post.lastEdited)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-1.5 hover:bg-gray-200 hover:text-primary rounded transition-colors text-gray-500"
                          onClick={(event) => {
                            event.stopPropagation();
                            onEdit(post);
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
                            onDelete(post);
                          }}
                          title="Delete Post"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination Container (Matching UserTable styling but simpler due to API limits) */}
      {(posts.length > 0 || currentPage > 1) && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 rounded-lg bg-orange-50 border border-orange-100 gap-4">
            <span className="text-sm text-gray-600">
              Showing page {currentPage}
            </span>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded transition-colors disabled:opacity-40 text-primary hover:bg-primary/10 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="text-sm font-medium text-primary">
                {currentPage}
              </span>

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
