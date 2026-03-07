import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetail";
import { PostFormView, PostContent, DeleteConfirmModal } from "../components";
import { Pencil, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    post,
    loading,
    error: detailError,
    handleUpdate,
    handleDelete,
    isDeleting,
  } = usePostDetail(id);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading post details...</span>
        </div>
      </div>
    );
  }

  if (detailError || !post) {
    return (
      <div className="flex h-64 items-center justify-center bg-white rounded-xl shadow-sm border border-red-100">
        <span className="text-red-500 font-medium">
          {detailError ?? "Post not found"}
        </span>
      </div>
    );
  }

  const goBack = () => navigate("/news");

  // Edit Mode View
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <nav className="text-sm text-gray-500">
            <span
              className="cursor-pointer hover:underline hover:text-gray-900 transition-colors"
              onClick={goBack}
            >
              News
            </span>
            <span className="mx-2">{">"}</span>
            <span
              className="cursor-pointer hover:underline hover:text-gray-900 transition-colors"
              onClick={() => setIsEditing(false)}
            >
              Post Detail
            </span>
            <span className="mx-2">{">"}</span>
            <span className="text-gray-900 font-medium">Edit</span>
          </nav>
        </div>

        <PostFormView
          mode="edit"
          initialPost={post}
          onSubmitEdit={async (payload) => {
            await handleUpdate(payload);
            setIsEditing(false); // return to read mode on success
          }}
        />
      </div>
    );
  }

  // Read Mode View
  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="text-sm text-gray-500">
          <span
            className="cursor-pointer hover:underline hover:text-gray-900 transition-colors"
            onClick={goBack}
          >
            News
          </span>
          <span className="mx-2">{">"}</span>
          <span className="text-gray-900 font-medium">Detail</span>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={goBack}>
            Back to List
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Post
          </Button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Content Area */}
        <div className="w-full lg:flex-1 space-y-6 bg-white p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
            <img
              src={post.avatarUrl}
              alt={post.authorName}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {post.authorName}
              </h2>
              <p className="text-sm text-gray-500">
                {formatDate(post.createDate)}
              </p>
            </div>

            <div className="ml-auto">
              <span
                className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                  post.privacy === "Public"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : post.privacy === "Private"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {typeof post.privacy === "string"
                  ? post.privacy.replace(/([A-Z])/g, " $1").trim()
                  : String(post.privacy || "Unknown")}
              </span>
            </div>
          </div>

          <div className="prose prose-sm max-w-none prose-img:rounded-md mt-6">
            {(post.Title || post.title) && (
              <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
                {post.Title || post.title}
              </h1>
            )}
            <PostContent html={post.content} />
          </div>

          {post.media && post.media.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Attached Media ({post.media.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {post.media.map((m) => (
                  <img
                    key={m.postMediaId}
                    src={`https://api.catspeak.com.vn${m.mediaUrl}`}
                    alt="attachment"
                    className="w-full h-40 object-cover rounded-lg border border-gray-100 bg-gray-50"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h3 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Post Metadata
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Post ID</dt>
                <dd className="font-medium text-gray-900">#{post.postId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(post.createDate)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Edited</dt>
                <dd className="font-medium text-gray-900">
                  {formatDate(post.lastEdited)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Total Reactions</dt>
                <dd className="font-medium text-gray-900">
                  {post.totalReactions}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          const success = await handleDelete();
          if (success) {
            setShowDeleteModal(false);
            navigate("/news");
          }
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}
