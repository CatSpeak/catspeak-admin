import React, { useState, useCallback } from "react";
import { Plus, LayoutGrid, List, DoorOpen, Loader2, AlertCircle } from "lucide-react";
import { useRooms } from "../hooks/useRooms";
import {
  RoomCard,
  RoomTable,
  RoomFilters,
  CreateRoomModal,
  DeleteRoomDialog,
  RoomDetailModal,
  RoomStats,
  Pagination,
} from "../components";
import type { ViewMode, Room } from "../types";

const RoomPage: React.FC = () => {
  const {
    rooms,
    pagination,
    filters,
    isLoading,
    error,
    stats,
    activeFilterCount,
    setPage,
    updateFilter,
    toggleFilterValue,
    clearFilters,
    deleteRoom,
    refetch,
  } = useRooms();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleDeleteRequest = useCallback(
    (id: number) => {
      const room = rooms.find((r) => r.roomId === id);
      if (room) setDeleteTarget(room);
    },
    [rooms],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteRoom(deleteTarget.roomId);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteRoom]);

  const handleRoomCreated = useCallback(() => {
    setIsCreateOpen(false);
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-full">
      <div className="mx-auto space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-primary font-bold text-gray-900 flex items-center gap-2">
              <DoorOpen size={24} className="text-primary" />
              Room Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage video call rooms — create, monitor, and remove rooms.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus size={16} />
            Create New Room
          </button>
        </div>

        {/* ── Stats ── */}
        <RoomStats stats={stats} />

        {/* ── Filters + View Toggle ── */}
        <div className="space-y-4">
          <RoomFilters
            filters={filters}
            activeFilterCount={activeFilterCount}
            onSearch={(v) => updateFilter("roomName", v)}
            onToggle={(key, value) => toggleFilterValue(key, value as never)}
            onClear={clearFilters}
          />

          {/* View toggle + result count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{pagination.totalItems}</span> rooms found
            </p>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all duration-200 ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
                  }`}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-all duration-200 ${viewMode === "table" ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"
                  }`}
                title="Table view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Error State ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle size={18} />
            <p className="text-sm">{error}</p>
            <button onClick={refetch} className="ml-auto text-sm font-medium underline hover:no-underline">Retry</button>
          </div>
        )}

        {/* ── Loading State ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-primary animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading rooms…</p>
          </div>
        ) : rooms.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <DoorOpen size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">No rooms found</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              {activeFilterCount > 0
                ? "Try adjusting your filters or search term."
                : "Create your first room to get started."}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="mt-4 text-sm text-primary font-medium hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room.roomId} room={room} onDelete={handleDeleteRequest} onClick={setSelectedRoom} />
            ))}
          </div>
        ) : (
          <RoomTable rooms={rooms} onDelete={handleDeleteRequest} onClick={setSelectedRoom} />
        )}

        {/* ── Pagination ── */}
        {!isLoading && rooms.length > 0 && (
          <Pagination pagination={pagination} onPageChange={setPage} />
        )}
      </div>

      {/* ── Modals ── */}
      <CreateRoomModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleRoomCreated}
      />
      <DeleteRoomDialog
        isOpen={!!deleteTarget}
        roomName={deleteTarget?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={isDeleting}
      />
      <RoomDetailModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </div>
  );
};

export default RoomPage;
