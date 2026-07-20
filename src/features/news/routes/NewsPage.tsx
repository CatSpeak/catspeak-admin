import { useState, useEffect } from "react";
import {
  Download,
  Plus,
  Newspaper,
  ImageIcon,
  Eye,
  Heart,
  MessageSquare,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/ui/Button";
import { PostAnalyticsCards } from "../components";
import type { Post } from "../types";
import { getPost } from "../../analytics/api/getAnalytics";
import type { AnalyticsPeriod, PostResponse } from "../../analytics/types";
import { getApiErrorMessage } from "../../../lib/axios";
import { PageHeader } from "../../../components/ui/PageHeader";
import Table from "../../../components/ui/table/Table";
import { getPosts } from "../api/getPosts";
import { formatDate } from "../../calendar/constants";
import Badge from "../../../components/ui/Badge";

export default function NewsPage() {
  const navigate = useNavigate();

  // Post Analytics States
  const [selectedPeriod, setSelectedPeriod] =
    useState<AnalyticsPeriod>("last7days");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [analyticsData, setAnalyticsData] = useState<PostResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if not custom, or if custom dates are both provided
    if (selectedPeriod === "custom" && (!fromDate || !toDate)) {
      return;
    }

    let active = true;
    const fetchAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const res = await getPost({
          period: selectedPeriod,
          ...(selectedPeriod === "custom" ? { fromDate, toDate } : {}),
        });
        if (active) {
          setAnalyticsData(res);
        }
      } catch (err: unknown) {
        if (active) {
          setAnalyticsError(
            getApiErrorMessage(err, "Failed to fetch post analytics."),
          );
        }
      } finally {
        if (active) {
          setAnalyticsLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      active = false;
    };
  }, [selectedPeriod, fromDate, toDate]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={<Newspaper />}
        title="News"
        desc="Draft, schedule, and publish official announcements and internal news updates."
        rightButtons={[
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>,
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/news/create")}
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Post
          </Button>,
        ]}
      />

      <PostAnalyticsCards
        analytics={analyticsData}
        loading={analyticsLoading}
        error={analyticsError}
        selectedPeriod={selectedPeriod}
        fromDate={fromDate}
        toDate={toDate}
        onPeriodChange={setSelectedPeriod}
        onDateRangeChange={(from, to) => {
          setFromDate(from);
          setToDate(to);
        }}
      />

      <Table<Post>
        fetcher={async (page, pageSize) => {
          const data = await getPosts(page, pageSize);
          return {
            data: data.data,
            total: data.total_records,
          };
        }}
        onClickRow={(p) => navigate(`/news/${p.slug}`)}
        headers={[
          {
            name: "ID",
            accessorKey: "postId",
          },
          {
            name: "Author",
            accessorKey: "authorName",
            render: (p) => (
              <div className="flex items-center gap-2">
                <img
                  src={p.avatarUrl}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-gray-700 whitespace-nowrap font-bold">
                  {p.authorName}
                </span>
              </div>
            ),
          },
          {
            name: "Preview",
            accessorKey: "content",
            render: (p) => {
              return (
                <span
                  className="text-gray-600 max-w-xs truncate block"
                  title={p.content ?? ""}
                >
                  {p.content ?? ""}
                </span>
              );
            },
          },
          {
            name: "Media",
            accessorKey: "media",
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
            name: "Privacy",
            accessorKey: "privacy",
            render: (p) => {
              switch (p.privacy) {
                case "Public":
                  return <Badge title="Public" type="Green" />;
                case "Private":
                  return <Badge title="Private" type="Blue" />;
                default:
                  return <Badge title={p.privacy || "Unknown"} type="Gray" />;
              }
            },
          },
          {
            name: "Community",
            accessorKey: "languageCommunity",
            render: (p) => <span>{p.languageCommunity || "All"}</span>,
          },
          {
            name: "views",
            accessorKey: "viewCount",
            render: (p) => (
              <div className="flex items-center justify-center gap-1.5 text-gray-700">
                <Eye size={14} className="text-gray-400" />
                <span>{p.viewCount}</span>
              </div>
            ),
          },
          {
            name: "Reactions",
            accessorKey: "totalReactions",
            render: (p) => (
              <div className="flex items-center justify-center gap-1.5 text-gray-700">
                <Heart size={14} className="text-gray-400" />
                <span>{p.totalReactions}</span>
              </div>
            ),
          },
          {
            name: "Comments",
            accessorKey: "totalComments",
            render: (p) => (
              <div className="flex items-center justify-center gap-1.5 text-gray-700">
                <MessageSquare size={14} className="text-gray-400" />
                <span>{p.totalComments}</span>
              </div>
            ),
          },
          {
            name: "Shares",
            accessorKey: "shareCount",
            render: (p) => (
              <div className="flex items-center justify-center gap-1.5 text-gray-700">
                <Share2 size={14} className="text-gray-400" />
                <span>{p.shareCount}</span>
              </div>
            ),
          },
          {
            name: "Date Created",
            accessorKey: "createDate",
            render: (p) => (
              <span className="whitespace-nowrap">
                {formatDate(p.createDate)}
              </span>
            ),
          },
          {
            name: "Last Edited",
            accessorKey: "lastEdited",
            render: (p) => (
              <span className="whitespace-nowrap">
                {formatDate(p.lastEdited)}
              </span>
            ),
          },
        ]}
      />

      {/* Optional: Filter Section matches UserTable style */}
      {/* <div className="flex gap-3 p-4 rounded-lg bg-orange-50 border border-accent/20">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search posts..."
          className="px-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary w-full max-w-sm"
        />
        <select
          value={communityFilter}
          onChange={(e) => setCommunityFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary text-gray-600 focus:border-primary"
        >
          <option value="All">All</option>
          <option value="English">English</option>
          <option value="Chinese">Chinese</option>
        </select>
      </div> */}

      {/* <PostTable
        posts={filteredPosts}
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
      /> */}
    </div>
  );
}
