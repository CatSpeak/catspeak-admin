import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePostDetail } from "../hooks/usePostDetail";
import { PostFormView, PostContent, DeleteConfirmModal } from "../components";
import { Pencil, Trash2, Eye, Heart, MessageSquare, Share2 } from "lucide-react";
import Button from "../../../components/ui/Button";

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    post,
    loading,
    error: detailError,
    handleUpdate,
    handleDelete,
    isDeleting,
  } = usePostDetail(slug);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading...</span>
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
            const response = await handleUpdate(payload);
            setIsEditing(false); // return to read mode on success
            if (response?.data?.slug && response.data.slug !== post.slug) {
              navigate(`/news/${response.data.slug}`, { replace: true });
            }
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
                className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${post.privacy === "Public"
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
                    src={m.mediaUrl}
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
          <div className="bg-white p-5 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-gray-100/50 space-y-6">
            {/* Header section with Post ID */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Post Details</span>
              <span className="bg-orange-50 text-primary border border-orange-100 rounded-md px-2 py-0.5 text-xs font-mono font-semibold">
                #{post.postId}
              </span>
            </div>

            {/* Language Community Section */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language Community</span>
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                {post.languageCommunity || "All"}
              </span>
            </div>

            {/* Engagement Stats Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Engagement Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/30 flex flex-col gap-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Eye size={12} className="text-indigo-500" /> Views
                  </span>
                  <span className="text-lg font-bold text-gray-900">{(post.viewCount ?? 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-rose-50/40 rounded-xl border border-rose-100/30 flex flex-col gap-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Heart size={12} className="text-rose-500" /> Reactions
                  </span>
                  <span className="text-lg font-bold text-gray-900">{(post.totalReactions ?? 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/30 flex flex-col gap-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <MessageSquare size={12} className="text-amber-500" /> Comments
                  </span>
                  <span className="text-lg font-bold text-gray-900">{(post.totalComments ?? 0).toLocaleString()}</span>
                </div>
                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/30 flex flex-col gap-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Share2 size={12} className="text-emerald-500" /> Shares
                  </span>
                  <span className="text-lg font-bold text-gray-900">{(post.shareCount ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Post Timeline */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Timeline</h4>

              <div className="relative pl-6 space-y-4">
                {/* Visual timeline vertical line */}
                <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-gray-100" />

                {/* Created Event */}
                <div className="relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-primary ring-4 ring-orange-50" />
                  <div className="text-xs font-semibold text-gray-400">Created</div>
                  <div className="text-sm font-semibold text-gray-800">{formatDate(post.createDate)}</div>
                </div>

                {/* Last Edited Event */}
                <div className="relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white bg-gray-400 ring-4 ring-gray-100" />
                  <div className="text-xs font-semibold text-gray-400">Last Edited</div>
                  <div className="text-sm font-semibold text-gray-800">{formatDate(post.lastEdited)}</div>
                </div>
              </div>
            </div>
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
