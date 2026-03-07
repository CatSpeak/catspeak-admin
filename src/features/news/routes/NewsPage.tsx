import { Download, RotateCcw, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { PostTable, DeleteConfirmModal } from "../components";
import { usePosts } from "../hooks/usePosts";
import { useManagePosts } from "../hooks/useManagePosts";
import type { Post } from "../types";

const FILTER_TEXT_PLACEHOLDERS = ["Search posts..."];

export default function NewsPage() {
  const navigate = useNavigate();
  const { posts, loading, error, currentPage, hasNextPage, goToPage } =
    usePosts();

  const {
    isDeleting,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    deleteTarget,
  } = useManagePosts();

  const handleEditClick = (post: Post) => {
    navigate(`/news/${post.postId}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-primary">List of Posts</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/news/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Optional: Filter Section matches UserTable style */}
      <div className="flex gap-3 p-4 rounded-lg bg-orange-50 border border-accent/20">
        {FILTER_TEXT_PLACEHOLDERS.map((placeholder) => (
          <input
            key={placeholder}
            type="text"
            placeholder={placeholder}
            className="px-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-sm"
          />
        ))}
      </div>

      <PostTable
        posts={posts}
        loading={loading}
        error={error}
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        goToPage={goToPage}
        onEdit={handleEditClick}
        onDelete={openDeleteModal}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
