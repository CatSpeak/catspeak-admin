import type { FormEvent } from "react"
import { Search, UserRound, X } from "lucide-react"
import Button from "../../../components/ui/Button"
import Tabs from "../../../components/ui/Tabs"
import { useModerationLabels } from "../hooks/useModerationLabels"
import type { AiAction, ContentKind } from "../types"
import {
  PLACE_KEYS,
  fmt,
  hasExtraFilters,
  type ModerationFilters,
  type PlaceKey,
} from "../utils/moderation"

interface ModerationFiltersBarProps {
  filters: ModerationFilters
  searchText: string
  pendingTotal: number
  pendingCounts: Record<PlaceKey, number>
  onSearchTextChange: (value: string) => void
  onChange: (patch: Partial<ModerationFilters>) => void
  onClear: () => void
}

const selectClass =
  "px-3.5 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-gray-800 cursor-pointer shadow-2xs"

const Count = ({ value, active }: { value: number; active: boolean }) => (
  <span
    className={`ml-1.5 min-w-5 px-1.5 rounded-full text-[11px] font-bold tabular-nums ${
      active ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"
    }`}
  >
    {value > 99 ? "99+" : value}
  </span>
)

export default function ModerationFiltersBar({
  filters,
  searchText,
  pendingTotal,
  pendingCounts,
  onSearchTextChange,
  onChange,
  onClear,
}: ModerationFiltersBarProps) {
  const L = useModerationLabels()
  const m = L.m
  const showCounts = filters.status === "pending"

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    onChange({ q: searchText })
  }

  const chip = (key: PlaceKey | null, label: string, count: number) => {
    const active = filters.place === key
    return (
      <button
        key={key ?? "all"}
        type="button"
        onClick={() => onChange({ place: key })}
        aria-pressed={active}
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
          active
            ? "bg-primary text-white border-primary"
            : "bg-white text-gray-700 border-gray-200 hover:border-primary/40 hover:text-primary"
        }`}
      >
        {label}
        {showCounts && count > 0 && <Count value={count} active={active} />}
      </button>
    )
  }

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-4">
      <Tabs
        activeTab={filters.status}
        onChange={(id) => onChange({ status: id as ModerationFilters["status"] })}
        tabs={[
          {
            id: "pending",
            label: (
              <span className="inline-flex items-center">
                {m.tabPending}
                {pendingTotal > 0 && <Count value={pendingTotal} active={false} />}
              </span>
            ),
          },
          { id: "resolved", label: m.tabResolved },
          { id: "all", label: m.tabAll },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {chip(null, m.allPlaces, pendingTotal)}
        {PLACE_KEYS.map((key) => chip(key, L.place(key), pendingCounts[key] ?? 0))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={submitSearch} className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={searchText}
            maxLength={200}
            onChange={(e) => onSearchTextChange(e.target.value)}
            placeholder={m.searchPlaceholder}
            aria-label={m.search}
            className="w-full pl-9 pr-9 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 text-gray-800 shadow-2xs"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => {
                onSearchTextChange("")
                onChange({ q: "" })
              }}
              aria-label={m.clearFilters}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <select
          value={filters.contentKind ?? ""}
          onChange={(e) => onChange({ contentKind: (e.target.value || undefined) as ContentKind | undefined })}
          className={selectClass}
          aria-label={m.kindAll}
        >
          <option value="">{m.kindAll}</option>
          <option value="text">{m.kinds.text}</option>
          <option value="image">{m.kinds.image}</option>
          <option value="video">{m.kinds.video}</option>
        </select>

        <select
          value={filters.action ?? ""}
          onChange={(e) => onChange({ action: (e.target.value || undefined) as AiAction | undefined })}
          className={selectClass}
          aria-label={m.actionAll}
        >
          <option value="">{m.actionAll}</option>
          <option value="review">{m.actions.review}</option>
          <option value="block">{m.actions.block}</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value as ModerationFilters["sort"] })}
          className={selectClass}
          aria-label={m.sortLabel}
        >
          <option value="newest">{m.sortNewest}</option>
          <option value="oldest">{m.sortOldest}</option>
          <option value="score">{m.sortScore}</option>
        </select>

        {filters.accountId && (
          <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
            <UserRound className="w-3.5 h-3.5" />
            {fmt(m.accountChip, { id: filters.accountId })}
            <button
              type="button"
              onClick={() => onChange({ accountId: undefined })}
              aria-label={m.clearFilters}
              className="p-0.5 rounded-full hover:bg-blue-100 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {hasExtraFilters(filters) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
          >
            {m.clearFilters}
          </Button>
        )}
      </div>
    </div>
  )
}
