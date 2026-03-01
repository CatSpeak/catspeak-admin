import { useState, useRef } from "react";
import { LayoutTemplate } from "lucide-react";
import type { Tab } from "../types";
import DOMPurify from "dompurify";
import { useCreatePost } from "../hooks/useCreatePost";
import { usePosts } from "../hooks/usePosts";
import {
  TabNav,
  ThumbnailGrid,
  PostEditor,
  UploadBlock,
  AddBlockRow,
  SettingsSidebar,
  CharCountInput,
} from "../components";

const NewsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("my_posts");

  const { posts, loading, error, currentPage, hasNextPage, goToPage } =
    usePosts();

  const {
    form,
    updateField,
    thumbnails,
    deleteThumbnail,
    addFiles,
    tags,
    activeTagId,
    toggleTag,
    handleSaveDraft,
    handlePublish,
    isSubmitting,
  } = useCreatePost();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileClick = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col h-full min-h-screen">
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-y-auto">
        <div className="w-full mx-auto">
          {activeTab === "create_new" && (
            <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start">
              {/* Left Column — Editor */}
              <div className="w-full xl:flex-1 space-y-6 p-6 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                {/* Title */}
                <div className="space-y-2">
                  <h2 className="text-base font-semibold text-gray-900">
                    Post Title
                  </h2>
                  <CharCountInput
                    value={form.title}
                    onChange={(val) => updateField("title", val)}
                    placeholder="Enter title"
                    className="text-sm text-gray-800"
                  />
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files);
                    e.target.value = ""; // Reset to allow same file reselection
                  }}
                />

                {/* Thumbnails */}
                <ThumbnailGrid
                  images={thumbnails}
                  onDelete={deleteThumbnail}
                  onUpload={handleFileClick}
                />

                {/* Section Divider */}
                <div className="flex items-center justify-center relative py-4">
                  <div className="absolute w-full h-px bg-gray-200" />
                  <span className="relative bg-white px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Post Content
                  </span>
                </div>

                {/* Rich Text Editor */}
                <PostEditor
                  value={form.content}
                  onChange={(val) => updateField("content", val)}
                />

                {/* Layout Chooser */}
                <div className="w-full bg-white border border-dashed border-red-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-red-50/30 transition-colors min-h-[160px]">
                  <div className="text-gray-300 flex flex-col items-center">
                    <LayoutTemplate size={48} strokeWidth={1} />
                    <span className="text-xs font-medium mt-2 italic">
                      Choose layout
                    </span>
                  </div>
                </div>

                {/* Image Upload + Caption */}
                <UploadBlock
                  caption={form.caption}
                  onCaptionChange={(val) => updateField("caption", val)}
                  onUpload={handleFileClick}
                />

                {/* Add Content Blocks */}
                <AddBlockRow />
              </div>

              {/* Right Column — Settings */}
              <SettingsSidebar
                status={form.status}
                privacy={form.privacy}
                onPrivacyChange={(val) => updateField("privacy", val as any)}
                publishDate={form.publishDate}
                publishTime={form.publishTime}
                onPublishDateChange={(val) => updateField("publishDate", val)}
                onPublishTimeChange={(val) => updateField("publishTime", val)}
                community={form.community}
                onCommunityChange={(val) => updateField("community", val)}
                tags={tags}
                activeTagId={activeTagId}
                onTagToggle={toggleTag}
                onSaveDraft={handleSaveDraft}
                onPublish={handlePublish}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {activeTab === "my_posts" && (
            <div className="space-y-4">
              {posts.length === 0 && !loading && !error && (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  No posts yet
                </div>
              )}
              {loading && (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  Loading posts...
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center h-32 text-red-400">
                  {error}
                </div>
              )}
              {posts.map((post) => (
                <div
                  key={post.postId}
                  className="p-6 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={post.avatarUrl}
                      alt={post.authorName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {post.authorName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div
                    className="text-gray-800 mb-4 [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_u]:underline [&_s]:line-through [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_a]:text-blue-500 [&_a]:underline"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(post.content),
                    }}
                  />
                  {post.media && post.media.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mb-4">
                      {post.media.map((m) => (
                        <img
                          key={m.postMediaId}
                          src={`https://api.catspeak.com.vn${m.mediaUrl}`}
                          alt="Post media"
                          className="h-40 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span>{post.totalReactions} Reactions</span>
                    <span className="capitalize">{post.privacy}</span>
                  </div>
                </div>
              ))}

              {/* Pagination controls */}
              {(posts.length > 0 || currentPage > 1) && (
                <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "manage" && (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Manage Posts (Coming soon)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
