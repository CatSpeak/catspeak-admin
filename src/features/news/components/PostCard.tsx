import { Pencil, Trash2 } from "lucide-react";
import PostContent from "./PostContent";
import type { Post } from "../types";

interface PostCardProps {
  post: Post;
  /** Show edit & delete action buttons */
  showActions?: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

const PostCard = ({
  post,
  showActions = false,
  onEdit,
  onDelete,
}: PostCardProps) => (
  <div className="group p-6 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
    {/* Header — author + actions */}
    <div className="flex items-center gap-4 mb-4">
      <img
        src={post.avatarUrl}
        alt={post.authorName}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {post.authorName}
        </h3>
        <p className="text-sm text-gray-500">
          {new Date(post.createDate).toLocaleString()}
        </p>
      </div>

      {showActions && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            id={`edit-post-${post.postId}`}
            onClick={() => onEdit?.(post)}
            title="Edit post"
            className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <Pencil size={16} />
          </button>
          <button
            id={`delete-post-${post.postId}`}
            onClick={() => onDelete?.(post)}
            title="Delete post"
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>

    {/* Content */}
    <PostContent html={post.content} className="mb-4" />

    {/* Media */}
    {post.media && post.media.length > 0 && (
      <div className="flex gap-2 overflow-x-auto mb-4 pb-1 no-scrollbar">
        {post.media.map((m) => (
          <img
            key={m.postMediaId}
            src={`https://api.catspeak.com.vn${m.mediaUrl}`}
            alt="Post media"
            className="h-40 rounded-lg object-cover shrink-0"
          />
        ))}
      </div>
    )}

    {/* Footer — reactions + privacy */}
    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
      <span>{post.totalReactions} Reactions</span>
      <span
        className={`px-3 py-0.5 text-xs font-medium rounded-full capitalize ${
          post.privacy === "Public"
            ? "bg-green-50 text-green-600"
            : post.privacy === "Private"
              ? "bg-red-50 text-red-500"
              : "bg-amber-50 text-amber-600"
        }`}
      >
        {post.privacy.replace(/([A-Z])/g, " $1").trim()}
      </span>
    </div>
  </div>
);

export default PostCard;
