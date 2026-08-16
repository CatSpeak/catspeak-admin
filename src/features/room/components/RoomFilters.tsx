import React from "react";
import { Search, X, Filter, ChevronDown, ChevronUp, User } from "lucide-react";
import type { RoomFilters as Filters } from "../types";
import { useLanguage } from "../../../stores/languageStore";
import {
  formatDateToUtcStartOfDay,
  formatDateToUtcEndOfDay,
} from "../../../lib/utils";

interface RoomFiltersProps {
  filters: Filters;
  activeFilterCount: number;
  onSearch: (value: string) => void;
  onHostSearch: (value: string) => void;
  onToggle: <K extends keyof Filters>(key: K, value: unknown) => void;
  onUpdate: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClear: () => void;
}

const ROOM_TYPE_CHIPS: { value: number }[] = [
  { value: 0 },
  { value: 1 },
];

const STATUS_CHIPS: { value: number; color: string; activeColor: string }[] = [
  { value: 1, color: "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50", activeColor: "bg-emerald-50 border-emerald-300 text-emerald-700" },
  { value: 0, color: "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50", activeColor: "bg-red-50 border-red-300 text-red-600" },
];

const RoomFiltersComponent: React.FC<RoomFiltersProps> = ({
  filters,
  activeFilterCount,
  onSearch,
  onHostSearch,
  onToggle,
  onUpdate,
  onClear,
}) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Search row */}
      <div className="flex items-center gap-3 p-4">
        {/* Room name search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.room.searchRoomName}
            value={filters.roomName}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          {filters.roomName && (
            <button onClick={() => onSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Host name search */}
        <div className="relative flex-1 max-w-xs">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.room.searchHostName}
            value={filters.hostName}
            onChange={(e) => onHostSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          {filters.hostName && (
            <button onClick={() => onHostSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Expand filters toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
            activeFilterCount > 0 || isExpanded
              ? "bg-primary/5 border-primary/20 text-primary"
              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter size={15} />
          {t.table.filters}
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {activeFilterCount > 0 && (
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
            {t.table.clearAll}
          </button>
        )}
      </div>

      {/* Expandable filter panel */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">

          {/* Room Type & Status chips row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Room Types */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.room.roomType}</p>
              <div className="flex flex-wrap gap-1.5">
                {ROOM_TYPE_CHIPS.map((chip) => {
                  const active = filters.roomTypes.includes(chip.value);
                  const label = chip.value === 0 ? t.room.oneToOneRooms : t.room.groupRooms;
                  return (
                    <button
                      key={chip.value}
                      onClick={() => onToggle("roomTypes", chip.value)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200 ${
                        active
                          ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Statuses */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.common.status}</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_CHIPS.map((chip) => {
                  const active = filters.statuses.includes(chip.value);
                  const label = chip.value === 1 ? t.common.active : t.common.inactive;
                  return (
                    <button
                      key={chip.value}
                      onClick={() => onToggle("statuses", chip.value)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200 ${
                        active ? chip.activeColor : chip.color
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date range row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.common.createdFrom}</p>
              <input
                type="date"
                value={filters.createdFrom ? filters.createdFrom.substring(0, 10) : ""}
                onChange={(e) =>
                  onUpdate("createdFrom", formatDateToUtcStartOfDay(e.target.value) || "")
                }
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.common.createdTo}</p>
              <input
                type="date"
                value={filters.createdTo ? filters.createdTo.substring(0, 10) : ""}
                onChange={(e) =>
                  onUpdate("createdTo", formatDateToUtcEndOfDay(e.target.value) || "")
                }
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Sort row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.common.sortBy}</p>
              <select
                value={filters.sortBy}
                onChange={(e) => onUpdate("sortBy", e.target.value as Filters["sortBy"])}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              >
                <option value="">{t.common.default}</option>
                <option value="Name">{t.common.name}</option>
                <option value="CreateDate">{t.common.createdDate}</option>
                <option value="Status">{t.common.status}</option>
              </select>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t.common.sortOrder}</p>
              <select
                value={filters.sortOrder}
                onChange={(e) => onUpdate("sortOrder", e.target.value as Filters["sortOrder"])}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              >
                <option value="Desc">{t.common.descending}</option>
                <option value="Asc">{t.common.ascending}</option>
              </select>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoomFiltersComponent;
