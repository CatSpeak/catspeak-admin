import { useCallback, useEffect, useMemo, useState } from "react"
import { Lock, Minus, RefreshCw, ShieldAlert } from "lucide-react"
import Avatar from "../../../components/ui/Avatar"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import { PageHeader } from "../../../components/ui/PageHeader"
import Table from "../../../components/ui/table/Table"
import type { TableHeader } from "../../../components/ui/table/types"
import { getApiErrorMessage } from "../../../lib/axios"
import { formatDateTime } from "../../../lib/utils"
import { useToastStore } from "../../../stores/toastStore"
import { bulkConfirmModerationLogs, getModerationLogs, getModerationStats } from "../api/contentModeration"
import BulkConfirmBar from "../components/BulkConfirmBar"
import ModerationDetailDrawer from "../components/ModerationDetailDrawer"
import ModerationFiltersBar from "../components/ModerationFiltersBar"
import ModerationSummaryCards from "../components/ModerationSummaryCards"
import { useModerationLabels } from "../hooks/useModerationLabels"
import type { ModerationLogItem, ModerationStats } from "../types"
import {
  DEFAULT_FILTERS,
  actionBadgeType,
  canBulkConfirm,
  fmt,
  formatScore,
  pendingByPlace,
  placeOfContext,
  statusBadgeType,
  toQuery,
  type ModerationFilters,
} from "../utils/moderation"

const checkboxClass = "w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"

export default function ContentModerationPage() {
  const L = useModerationLabels()
  const m = L.m
  const { addToast } = useToastStore()

  // version tăng khi cần tải lại trang hiện tại mà không đổi bộ lọc (giữ nguyên số trang).
  const [list, setList] = useState({ filters: DEFAULT_FILTERS, version: 0 })
  const [searchText, setSearchText] = useState("")
  const [pageItems, setPageItems] = useState<ModerationLogItem[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [openId, setOpenId] = useState<number | null>(null)

  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [statsVersion, setStatsVersion] = useState(0)

  const filters = list.filters

  useEffect(() => {
    let active = true
    getModerationStats(7)
      .then((data) => {
        if (!active) return
        setStats(data)
        setStatsError(null)
      })
      .catch((err) => {
        if (active) setStatsError(getApiErrorMessage(err, m.loadStatsFailed))
      })
      .finally(() => {
        if (active) setStatsLoading(false)
      })
    return () => {
      active = false
    }
  }, [statsVersion, m.loadStatsFailed])

  const fetcher = useCallback(
    async (page: number, pageSize: number) => {
      const res = await getModerationLogs(toQuery(list.filters, page, pageSize))
      setPageItems(res.items)
      return { data: res.items, total: res.total }
    },
    [list],
  )

  const refresh = useCallback(() => {
    setList((s) => ({ ...s, version: s.version + 1 }))
    setStatsVersion((v) => v + 1)
  }, [])

  const changeFilters = (patch: Partial<ModerationFilters>) => {
    setList((s) => ({ filters: { ...s.filters, ...patch }, version: 0 }))
    setSelectedIds([])
  }

  const clearFilters = () => {
    setSearchText("")
    changeFilters({ ...DEFAULT_FILTERS, status: filters.status })
  }

  const filterAccount = (accountId: number) => {
    setOpenId(null)
    changeFilters({ accountId })
  }

  const toggleSelect = (id: number) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const selectableIds = useMemo(() => pageItems.filter(canBulkConfirm).map((i) => i.id), [pageItems])
  const pageAllSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id))
  const togglePage = () =>
    setSelectedIds((ids) =>
      pageAllSelected ? ids.filter((id) => !selectableIds.includes(id)) : [...new Set([...ids, ...selectableIds])],
    )

  const bulkConfirm = async () => {
    try {
      const res = await bulkConfirmModerationLogs(selectedIds)
      addToast("success", fmt(m.bulkConfirmDone, { updated: res.updatedIds.length, skipped: res.skipped }))
      setSelectedIds([])
      refresh()
    } catch (err) {
      addToast("error", getApiErrorMessage(err, m.bulkConfirmFailed))
    }
  }

  const selecting = filters.status === "pending"

  const headers: TableHeader<ModerationLogItem>[] = [
    ...(selecting
      ? [
          {
            id: "select",
            name: m.colSelect,
            width: 56,
            cell: (_: unknown, row: ModerationLogItem) =>
              canBulkConfirm(row) ? (
                <span
                  className="flex justify-center"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    aria-label={fmt(m.selectRow, { id: row.id })}
                    className={checkboxClass}
                  />
                </span>
              ) : (
                <span className="flex justify-center text-gray-300" title={m.bulkOnlySingle}>
                  <Minus className="w-4 h-4" />
                </span>
              ),
          },
        ]
      : []),
    {
      id: "createdAt",
      name: m.colTime,
      cell: (_, r) => <span className="text-sm text-gray-600 whitespace-nowrap">{formatDateTime(r.createdAt)}</span>,
    },
    {
      id: "place",
      name: m.colPlace,
      cell: (_, r) => {
        const place = placeOfContext(r.context)
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800 whitespace-nowrap flex items-center gap-1">
              {r.isPrivate && <Lock className="w-3.5 h-3.5 text-gray-400" aria-label={m.privateBadge} />}
              {place ? L.place(place) : L.context(r.context)}
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">{L.context(r.context)}</span>
          </div>
        )
      },
    },
    {
      id: "user",
      name: m.colUser,
      cell: (_, r) => {
        if (!r.accountId) return <span className="text-xs text-gray-400">{m.noAccount}</span>
        const name = r.account?.nickname || r.account?.username || `#${r.accountId}`
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar name={name} url={r.account?.avatarUrl} size="sm" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{name}</p>
              <p className="text-xs text-gray-400">#{r.accountId}</p>
            </div>
          </div>
        )
      },
    },
    {
      id: "content",
      name: m.colContent,
      cell: (_, r) =>
        r.contentKind === "text" ? (
          <p
            className="text-sm text-gray-700 max-w-md truncate"
            title={r.isPrivate && !r.revealed ? m.privateMaskedHint : (r.text ?? "")}
          >
            {r.text || m.noText}
          </p>
        ) : (
          <span className="text-sm text-gray-700">
            {fmt(m.mediaItem, { kind: L.kind(r.contentKind), file: r.text || (r.targetId ? `#${r.targetId}` : "—") })}
          </span>
        ),
    },
    {
      id: "ai",
      name: m.colAi,
      cell: (_, r) => (
        <div className="flex flex-col items-start gap-1">
          <Badge title={L.aiAction(r.action)} type={actionBadgeType(r.action)} />
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {r.violatedLabel ?? "—"} · {formatScore(r.score)}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      name: m.colStatus,
      cell: (_, r) => (
        <div className="flex flex-col items-start gap-1">
          <Badge title={L.status(r.reviewStatus)} type={statusBadgeType(r.reviewStatus)} showDot />
          {r.userAction && r.userAction !== "none" && (
            <span className="text-xs text-gray-500 whitespace-nowrap">{L.userAction(r.userAction)}</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        icon={<ShieldAlert />}
        title={m.title}
        desc={m.desc}
        rightButtons={[
          <Button
            key="refresh"
            variant="outline"
            size="sm"
            onClick={() => {
              setStatsLoading(true)
              refresh()
            }}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="cursor-pointer"
          >
            {m.refresh}
          </Button>,
        ]}
      />

      <ModerationSummaryCards stats={stats} loading={statsLoading} error={statsError} />

      <ModerationFiltersBar
        filters={filters}
        searchText={searchText}
        pendingTotal={stats?.pendingTotal ?? 0}
        pendingCounts={pendingByPlace(stats?.pendingByContext)}
        onSearchTextChange={setSearchText}
        onChange={changeFilters}
        onClear={clearFilters}
      />

      {selecting && selectableIds.length > 0 && (
        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer select-none">
          <input type="checkbox" checked={pageAllSelected} onChange={togglePage} className={checkboxClass} />
          {pageAllSelected ? m.unselectPage : m.selectPage}
        </label>
      )}

      <Table<ModerationLogItem>
        key={JSON.stringify(filters)}
        headers={headers}
        fetcher={fetcher}
        showGlobalSearch={false}
        defaultPageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        keyExtractor={(r) => r.id}
        entityName={m.entityName}
        onClickRow={(r) => setOpenId(r.id)}
      />

      <BulkConfirmBar count={selectedIds.length} onClear={() => setSelectedIds([])} onConfirm={bulkConfirm} />

      {openId !== null && (
        <ModerationDetailDrawer
          key={openId}
          logId={openId}
          onClose={() => setOpenId(null)}
          onDecided={() => refresh()}
          onFilterAccount={filterAccount}
        />
      )}
    </div>
  )
}
