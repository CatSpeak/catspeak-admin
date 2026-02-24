import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import type { Tab } from "../types";
import { useCreatePost } from "../hooks/useCreatePost";
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

  const {
    form,
    updateField,
    thumbnails,
    deleteThumbnail,
    tags,
    activeTagId,
    toggleTag,
    handleSaveDraft,
    handlePublish,
  } = useCreatePost();

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

                {/* Thumbnails */}
                <ThumbnailGrid images={thumbnails} onDelete={deleteThumbnail} />

                {/* Section Divider */}
                <div className="flex items-center justify-center relative py-4">
                  <div className="absolute w-full h-px bg-gray-200" />
                  <span className="relative bg-white px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Post Content
                  </span>
                </div>

                {/* Rich Text Editor */}
                <PostEditor
                  content={form.content}
                  onContentChange={(val) => updateField("content", val)}
                  autoSavedAt="14:30"
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
                />

                {/* Add Content Blocks */}
                <AddBlockRow />
              </div>

              {/* Right Column — Settings */}
              <SettingsSidebar
                status={form.status}
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
              />
            </div>
          )}

          {activeTab === "my_posts" && (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No posts yet
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
