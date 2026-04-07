import React from "react";
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import type { RoomFilters as Filters } from "../types";
import { ROOM_TYPES, LANGUAGE_TYPES, REQUIRED_LEVELS, ROOM_CATEGORIES, ROOM_TOPICS } from "../constants";

interface RoomFiltersProps {
  filters: Filters;
  activeFilterCount: number;
  onSearch: (value: string) => void;
  onToggle: <K extends keyof Filters>(key: K, value: unknown) => void;
  onClear: () => void;
}

const FilterChipGroup: React.FC<{
  label: string;
  items: { value: string; label: string; extra?: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}> = ({ label, items, selected, onToggle }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const active = selected.includes(item.value);
        return (
          <button
            key={item.value}
            onClick={() => onToggle(item.value)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200 ${active
              ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            {item.extra && <span>{item.extra}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  </div>
);

const RoomFiltersComponent: React.FC<RoomFiltersProps> = ({
  filters,
  activeFilterCount,
  onSearch,
  onToggle,
  onClear,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Search + Toggle bar */}
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search rooms…"
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

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${activeFilterCount > 0 || isExpanded
            ? "bg-primary/5 border-primary/20 text-primary"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
        >
          <Filter size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {activeFilterCount > 0 && (
          <button onClick={onClear} className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium">
            Clear all
          </button>
        )}
      </div>

      {/* Expandable filter panel */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <FilterChipGroup
              label="Room Type"
              items={ROOM_TYPES.map((t) => ({ value: t.value, label: t.label }))}
              selected={filters.roomTypes}
              onToggle={(v) => onToggle("roomTypes", v)}
            />
            <FilterChipGroup
              label="Language"
              items={LANGUAGE_TYPES.map((t) => ({ value: t.value, label: t.label, extra: t.flag }))}
              selected={filters.languageTypes}
              onToggle={(v) => onToggle("languageTypes", v)}
            />
            <FilterChipGroup
              label="Category"
              items={ROOM_CATEGORIES.map((t) => ({ value: t.value, label: t.label }))}
              selected={filters.categories}
              onToggle={(v) => onToggle("categories", v)}
            />
          </div>
          <FilterChipGroup
            label="Level"
            items={REQUIRED_LEVELS.map((t) => ({ value: t.value, label: t.label }))}
            selected={filters.requiredLevels}
            onToggle={(v) => onToggle("requiredLevels", v)}
          />
          <FilterChipGroup
            label="Topic"
            items={ROOM_TOPICS.map((t) => ({ value: t.value, label: t.label }))}
            selected={filters.topics}
            onToggle={(v) => onToggle("topics", v)}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomFiltersComponent;
