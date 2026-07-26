import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
} from "lucide-react";
import { EventDetailModal, DeleteEventDialog } from "../components";
import { useCalendar } from "../hooks/useCalendar";
import { useEventDetail } from "../hooks/useEventDetail";
import { getApiErrorMessage } from "../../../lib/axios";
import type { DayEvent } from "../types";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useLanguage } from "../../../stores/languageStore";
import Avatar from "../../../components/ui/Avatar";

export default function CalendarPage() {
  const { t } = useLanguage();
  const {
    selectedDate,
    monthDays,
    dayEvents,
    selectedDayDate,
    isLoadingCounts,
    isLoadingDay,
    error,
    goToPrev,
    goToNext,
    goToToday,
    goToDate,
    fetchDayEvents,
    deleteEvent,
  } = useCalendar();

  // Tự động fetch sự kiện cho ngày hiện tại khi component mount hoặc khi chuyển tháng
  useEffect(() => {
    if (!selectedDayDate) {
      fetchDayEvents(selectedDate);
    }
  }, [selectedDate, selectedDayDate, fetchDayEvents]);

  // ── Event detail modal ──
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const {
    event: detailEvent,
    isLoading: isDetailLoading,
    error: detailError,
  } = useEventDetail(selectedEventId);

  // ── Delete flow ──
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Xử lý khi click vào ô ngày ở lịch tháng ──
  const handleDayClick = useCallback(
    (date: Date) => {
      goToDate(date);
      fetchDayEvents(date);
    },
    [goToDate, fetchDayEvents],
  );

  // ── Mở modal chi tiết khi click vào sự kiện ──
  const handleEventClick = useCallback((event: DayEvent) => {
    setSelectedEventId(event.eventId);
  }, []);

  // ── Yêu cầu xóa từ modal chi tiết ──
  const handleDeleteRequest = useCallback(
    (eventId: number) => {
      const title = detailEvent?.title ?? "this event";
      setSelectedEventId(null);
      setDeleteTarget({ id: eventId, title });
    },
    [detailEvent],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteEvent(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, "Failed to delete event."));
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteEvent]);

  // Format nhãn hiển thị tháng/năm
  const monthLabel = useMemo(() => {
    const month = selectedDate.getMonth() + 1;
    const year = selectedDate.getFullYear();
    return `${t.calendar.month} ${month} / ${year}`;
  }, [selectedDate, t]);

  // Format nhãn tiêu đề danh sách sự kiện bên phải
  const eventListLabel = useMemo(() => {
    if (!selectedDayDate) return t.nav.calendar;
    const d = selectedDayDate.getDate();
    const m = selectedDayDate.getMonth() + 1;
    return `${t.calendar.eventsOn} ${d}/${m}`;
  }, [selectedDayDate, t]);

  const handleGoToToday = useCallback(() => {
    const today = new Date();

    goToToday();
    goToDate(today);
    fetchDayEvents(today);
  }, [goToToday, goToDate, fetchDayEvents]);

  return (
    <div className="space-y-4 px-6 pt-5 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <PageHeader
          icon={<Calendar />}
          title={t.calendar.title}
          desc={t.calendar.desc}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToToday}
            className="px-4 py-1.5 rounded-full border border-[#990011] text-sm font-medium hover:bg-[#990011]/5 transition-colors text-[#990011] cursor-pointer"
          >
            {t.calendar.today}
          </button>
        </div>
      </div>

      {/* Error state */}
      {(error || deleteError) && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle size={18} />
          <p className="text-sm">{error || deleteError}</p>
        </div>
      )}

      {/* Grid Layout chia làm 2 bên: Trái là Lịch, Phải là Sự kiện */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 mt-10 lg:items-start">
        {/* BÊN TRÁI: LỊCH THEO THÁNG */}
        <div className="flex flex-col gap-4 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100">
          {/* Header của lịch tháng */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrev}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={16} className="text-[#990011]" />
              </button>
              <span className="text-lg font-semibold text-black min-w-[140px] text-center uppercase">
                {monthLabel}
              </span>
              <button
                onClick={goToNext}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={16} className="text-[#990011]" />
              </button>
            </div>
          </div>

          {/* Các thứ trong tuần */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-gray-100 pb-2">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid ngày */}
          {isLoadingCounts ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-y-2 relative">
              {monthDays.map((cell, idx) => {
                const isSelected =
                  selectedDayDate &&
                  cell.date.toDateString() === selectedDayDate.toDateString();

                // Quy định class style theo sample htm:
                // - Hôm nay: tô viền `border border-[#990011]`
                // - Được chọn: tô nền `bg-[#990011] text-white`
                let btnClass =
                  "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full text-md font-medium transition-all ";

                if (!cell.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="h-16 flex items-center justify-center"
                    >
                      <span className="text-md text-gray-300">
                        {cell.date.getDate()}
                      </span>
                    </div>
                  );
                }

                if (isSelected) {
                  btnClass += "bg-[#990011] text-white shadow-md";
                } else if (cell.isToday) {
                  btnClass +=
                    "border-2 border-[#990011] text-[#990011] font-bold";
                } else {
                  btnClass +=
                    "text-gray-700 hover:border hover:border-[#990011] hover:text-[#990011]";
                }

                return (
                  <div
                    key={idx}
                    className="h-16 flex items-center justify-center relative"
                  >
                    <button
                      onClick={() => handleDayClick(cell.date)}
                      className={btnClass}
                    >
                      {cell.date.getDate()}
                    </button>

                    {/* Chấm tròn/Thanh hiển thị có sự kiện ở dưới góc hoặc bottom */}
                    {cell.eventCount > 0 && (
                      <span
                        className={`absolute top-0 right-0 size-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border
                          ${
                            isSelected
                              ? "bg-white text-[#990011] border-[#990011]"
                              : "bg-[#990011] text-white border-white"
                          }`}
                      >
                        {cell.eventCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Chú thích lịch (Bám sát theo file sample.html) */}
          <div className="flex items-center justify-between px-1 mt-4 pt-4 border-t border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-[#990011] flex items-center justify-center">
                <span className="text-[10px] text-[#990011] font-semibold">
                  01
                </span>
              </div>
              <span className="text-[12px] text-gray-500">
                {t.calendar.today}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#990011] flex items-center justify-center">
                <span className="text-[10px] text-white font-semibold">01</span>
              </div>
              <span className="text-[12px] text-gray-500">
                {t.calendar.selected}
              </span>
            </div>
          </div>
        </div>

        {/* BÊN PHẢI: DANH SÁCH SỰ KIỆN */}
        <div className="flex flex-col h-full bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[450px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-black">
              {eventListLabel}
            </h3>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-[#990011]/10 text-[#990011] px-2.5 py-1 rounded-full font-medium">
                {dayEvents.length}
              </span>
            )}
          </div>

          {isLoadingDay ? (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 size={24} className="text-[#990011] animate-spin" />
            </div>
          ) : dayEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-20 space-y-2">
              <Calendar size={36} className="stroke-[1.5]" />
              <p className="text-sm">{t.calendar.noEvents}</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1">
              <div className="flex flex-col gap-2">
                {dayEvents.map((event) => {
                  // Định dạng thời gian hiển thị từ chuỗi ISO string
                  const startHour = new Date(
                    event.startTime,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const endHour = new Date(event.endTime).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" },
                  );

                  return (
                    <div
                      key={event.eventId}
                      onClick={() => handleEventClick(event)}
                      className="flex flex-col rounded-2xl transition-all border border-transparent bg-[#F5F5F5] hover:border-[#990011]/40 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 px-4 py-3.5 w-full">
                        {/* Biểu tượng màu của Event */}
                        <Avatar
                          name={event.title}
                          className="w-12 h-12 md:w-14 md:h-14"
                        />

                        {/* Chi tiết Event */}
                        <div className="flex flex-col flex-1 min-w-0 gap-1.5">
                          <span className="text-[15px] font-semibold text-black truncate leading-tight">
                            {event.title}
                          </span>

                          <div className="flex items-center gap-2 text-xs text-black/75">
                            <Clock
                              size={14}
                              className="shrink-0 text-black/60"
                            />
                            <span>{`${startHour} - ${endHour}`}</span>
                          </div>

                          {/* <div className="flex items-center gap-2 text-xs text-black/75">
                            <MapPin
                              size={14}
                              className="shrink-0 text-black/60"
                            />
                            <span className="truncate">
                              Hội trường / Trực tuyến
                            </span>
                          </div> */}
                        </div>

                        {/* Người tham gia hoặc Slot trạng thái */}
                        <div className="shrink-0 flex flex-col items-end gap-1 min-w-[70px]">
                          <div className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Tag size={12} className="shrink-0" />
                            <span>Slot(s)</span>
                          </div>
                          <span className="text-xs font-bold text-[#990011]">
                            {event.currentParticipants}/{event.maxParticipants}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event detail modal */}
      <EventDetailModal
        isOpen={selectedEventId !== null}
        event={detailEvent}
        isLoading={isDetailLoading}
        error={detailError}
        onClose={() => setSelectedEventId(null)}
        onDelete={handleDeleteRequest}
      />

      {/* Delete confirmation */}
      <DeleteEventDialog
        isOpen={!!deleteTarget}
        eventTitle={deleteTarget?.title ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
