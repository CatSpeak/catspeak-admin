import React, { useEffect, useRef } from "react";
import { X, MapPin } from "lucide-react";
import Button from "../../../components/ui/Button";
import type { CalendarEvent, EventColor, EventPrefill } from "../types";
import { EVENT_COLORS } from "../constants";
import { useCreateEvent } from "../hooks/useCreateEvent";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: CalendarEvent) => void;
  prefill?: EventPrefill;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  prefill,
}) => {
  const { form, errors, isSubmitting, updateField, handleSubmit, resetForm } =
    useCreateEvent((event) => {
      onEventCreated(event);
      onClose();
    }, prefill);

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => titleRef.current?.focus(), 100);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  const inputBase =
    "w-full px-3 py-2 text-sm rounded-lg border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create Event"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-lg animate-[scaleIn_200ms_ease-out] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Create Event</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="event-title"
              ref={titleRef}
              type="text"
              placeholder="Event title"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={`${inputBase} ${errors.title ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                Location
              </span>
            </label>
            <input
              id="event-location"
              type="text"
              placeholder="Add location or room"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={`${inputBase} border-gray-200`}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="event-description"
              rows={3}
              placeholder="Add details about the event..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={`${inputBase} border-gray-200 resize-none`}
            />
          </div>

          {/* All day toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.isAllDay}
              onClick={() => updateField("isAllDay", !form.isAllDay)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                form.isAllDay ? "bg-primary" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isAllDay ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">All day</span>
          </div>

          {/* Date / Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="event-start-date"
                type="date"
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
                className={`${inputBase} ${errors.startDate ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>

            {!form.isAllDay && (
              <div>
                <label htmlFor="event-start-time" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  id="event-start-time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => updateField("startTime", e.target.value)}
                  className={`${inputBase} border-gray-200`}
                />
              </div>
            )}

            <div>
              <label htmlFor="event-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                id="event-end-date"
                type="date"
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
                className={`${inputBase} ${errors.endDate ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>

            {!form.isAllDay && (
              <div>
                <label htmlFor="event-end-time" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  id="event-end-time"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  className={`${inputBase} border-gray-200`}
                />
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(EVENT_COLORS) as [EventColor, (typeof EVENT_COLORS)["red"]][]).map(
                ([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateField("color", key)}
                    aria-label={cfg.label}
                    className={`w-8 h-8 rounded-full transition-all cursor-pointer flex items-center justify-center ${cfg.dot} ${
                      form.color === key
                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                        : "hover:scale-110"
                    }`}
                  >
                    {form.color === key && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            Create Event
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
