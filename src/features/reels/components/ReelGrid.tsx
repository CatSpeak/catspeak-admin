import { useRef, useState, useEffect, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ReelCard } from "./ReelCard";
import type { ReelDto, ReelStatus } from "../types";
import { Plus, Film } from "lucide-react";
import Button from "../../../components/ui/Button";

interface ReelGridProps {
  reels: ReelDto[];
  loading: boolean;
  selectedIds: number[];
  onSelect: (reelId: number) => void;
  onPreview: (reel: ReelDto) => void;
  onEdit: (reel: ReelDto) => void;
  onDelete: (reel: ReelDto) => void;
  onTogglePublish: (reel: ReelDto) => Promise<void>;
  getMappedStatus: (reel: ReelDto) => ReelStatus;
  onUploadClick: () => void;
}

export default function ReelGrid({
  reels,
  loading,
  selectedIds,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onTogglePublish,
  getMappedStatus,
  onUploadClick,
}: ReelGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(4);

  // Responsive column calculation via ResizeObserver
  useEffect(() => {
    if (!parentRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width >= 1200) {
          setColumns(4);
        } else if (width >= 900) {
          setColumns(3);
        } else if (width >= 600) {
          setColumns(2);
        } else {
          setColumns(1);
        }
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(parentRef.current);

    return () => observer.disconnect();
  }, []);

  // Group reels into grid rows
  const rows = useMemo(() => {
    const r: ReelDto[][] = [];
    for (let i = 0; i < reels.length; i += columns) {
      r.push(reels.slice(i, i + columns));
    }
    return r;
  }, [reels, columns]);

  // TanStack Virtual intentionally returns non-memoizable helpers.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 620, // Estimated height of ReelCard + gaps
    overscan: 2,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Skeleton Loader elements matching layout
  const renderSkeletons = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 w-full animate-pulse">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex flex-col bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
            <div className="aspect-[9/16] w-full bg-gray-250 rounded-xl" />
            <div className="h-5 w-2/3 bg-gray-250 rounded" />
            <div className="h-4 w-5/6 bg-gray-250 rounded" />
            <div className="h-9 w-full bg-gray-200 rounded-xl mt-auto" />
          </div>
        ))}
      </div>
    );
  };

  if (loading && reels.length === 0) {
    return renderSkeletons();
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-2xl min-h-[45vh] text-center max-w-xl mx-auto shadow-sm my-6">
        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-6 text-primary">
          <Film className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">No reels found</h3>
        <p className="text-sm text-gray-500 mb-6 max-w-md leading-relaxed">
          There are no video reels matching your search criteria or filters. Start the conversation by uploading your first video!
        </p>

        <Button variant="primary" size="sm" onClick={onUploadClick}>
          <Plus className="w-4 h-4 mr-2 animate-bounce" />
          Upload your first reel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scrollable Container */}
      <div
        ref={parentRef}
        className="w-full overflow-y-auto max-h-[75vh] pr-2 scrollbar-thin scrollbar-thumb-primary hover:scrollbar-thumb-primary-dark"
      >
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {virtualItems.map((virtualRow) => {
            const rowItems = rows[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                className="absolute top-0 left-0 w-full grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  transform: `translateY(${virtualRow.start}px)`,
                  height: `${virtualRow.size}px`,
                  paddingBottom: "24px", // Matches row gaps
                }}
              >
                {rowItems.map((reel) => (
                  <ReelCard
                    key={reel.reelId}
                    reel={reel}
                    isSelected={selectedIds.includes(reel.reelId)}
                    onSelect={onSelect}
                    onPreview={onPreview}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTogglePublish={onTogglePublish}
                    status={getMappedStatus(reel)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
