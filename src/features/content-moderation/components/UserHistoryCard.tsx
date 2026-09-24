import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ExternalLink, Filter, Loader2 } from "lucide-react"
import Avatar from "../../../components/ui/Avatar"
import Badge from "../../../components/ui/Badge"
import { getApiErrorMessage } from "../../../lib/axios"
import { formatDate, formatDateTime } from "../../../lib/utils"
import { getModerationUserHistory } from "../api/contentModeration"
import { useModerationLabels } from "../hooks/useModerationLabels"
import type { ModerationUserHistory } from "../types"
import { fmt, statusBadgeType } from "../utils/moderation"

interface UserHistoryCardProps {
  accountId: number
  currentLogId: number
  onFilterAccount: (accountId: number) => void
}

/** Tài khoản đăng nội dung và các lần vi phạm trước đó. Cha đặt key theo accountId. */
export default function UserHistoryCard({ accountId, currentLogId, onFilterAccount }: UserHistoryCardProps) {
  const L = useModerationLabels()
  const m = L.m
  const [history, setHistory] = useState<ModerationUserHistory | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getModerationUserHistory(accountId, 6)
      .then((data) => active && setHistory(data))
      .catch((err) => active && setError(getApiErrorMessage(err, m.histLoadFailed)))
    return () => {
      active = false
    }
  }, [accountId, m.histLoadFailed])

  if (error) return <p className="text-sm text-red-600">{error}</p>
  if (!history)
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    )

  const acc = history.account
  const name = acc?.nickname || acc?.username || `#${accountId}`
  const stats = [
    { label: m.histTotal, value: history.total },
    { label: m.histBlocks, value: history.blocks },
    { label: m.histConfirmed, value: history.confirmed },
    { label: m.histAllowed, value: history.allowed },
    { label: m.histWarns, value: history.warns },
    { label: m.histLocks, value: history.locks },
  ]
  const others = history.recent.filter((r) => r.id !== currentLogId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={name} url={acc?.avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">
              #{accountId}
              {acc?.username && acc.nickname ? ` · @${acc.username}` : ""}
            </p>
          </div>
          {acc && (
            <Badge
              title={L.accountStatus(acc.status)}
              type={acc.status === 3 ? "Red" : acc.status === 2 ? "Gray" : "Green"}
              showDot
            />
          )}
        </div>
        <Link
          to={`/users/${accountId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline shrink-0"
        >
          {m.viewProfile}
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
            <p className="text-lg font-extrabold text-gray-900 tabular-nums">{s.value}</p>
            <p className="text-[11px] font-semibold text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {history.firstAt && (
        <p className="text-xs text-gray-500">
          {fmt(m.histRange, { first: formatDate(history.firstAt), last: formatDate(history.lastAt) })}
        </p>
      )}

      {others.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.histRecent}</p>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
            {others.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center gap-2 px-3 py-2 text-xs">
                <span className="text-gray-400 tabular-nums whitespace-nowrap">{formatDateTime(r.createdAt)}</span>
                <span className="font-semibold text-gray-700 whitespace-nowrap">{L.context(r.context)}</span>
                <span className="flex-1 truncate text-gray-600" title={r.text ?? ""}>
                  {r.text || L.kind(r.contentKind)}
                </span>
                <Badge title={L.status(r.reviewStatus)} type={statusBadgeType(r.reviewStatus)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {history.total > 1 && (
        <button
          type="button"
          onClick={() => onFilterAccount(accountId)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          <Filter className="w-3.5 h-3.5" />
          {m.histViewAll}
        </button>
      )}
    </div>
  )
}
