import { useEffect, useState, type ReactNode } from "react"
import { AlertTriangle, CheckCircle2, Loader2, Lock, X } from "lucide-react"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import { getApiErrorMessage } from "../../../lib/axios"
import { formatDateTime } from "../../../lib/utils"
import { getModerationLog } from "../api/contentModeration"
import { useModerationLabels } from "../hooks/useModerationLabels"
import type { DecisionResponse, ModerationLogDetail, ModerationLogItem } from "../types"
import { actionBadgeType, fmt, formatScore, placeOfContext, statusBadgeType } from "../utils/moderation"
import DecisionForm from "./DecisionForm"
import ModerationContent from "./ModerationContent"
import UserHistoryCard from "./UserHistoryCard"

interface ModerationDetailDrawerProps {
  logId: number
  onClose: () => void
  onDecided: (res: DecisionResponse) => void
  onFilterAccount: (accountId: number) => void
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-3">
    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</h4>
    {children}
  </section>
)

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="space-y-0.5">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
    <div className="text-sm font-medium text-gray-800">{children}</div>
  </div>
)

/** Bảng chi tiết một ca bên phải màn hình. Cha đặt key theo logId. */
export default function ModerationDetailDrawer({ logId, onClose, onDecided, onFilterAccount }: ModerationDetailDrawerProps) {
  const L = useModerationLabels()
  const m = L.m
  const [detail, setDetail] = useState<ModerationLogDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState<DecisionResponse | null>(null)
  const [editing, setEditing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    let active = true
    getModerationLog(logId)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err, m.loadDetailFailed))
      })
    return () => {
      active = false
    }
  }, [logId, reloadToken, m.loadDetailFailed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !modalOpen) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, modalOpen])

  const reload = () => {
    setError(null)
    setDetail(null)
    setEditing(false)
    setReloadToken((n) => n + 1)
  }

  const handleDone = (res: DecisionResponse) => {
    if (res.log) setDetail(res.log)
    setResult(res)
    setEditing(false)
    onDecided(res)
  }

  const handleRevealed = (item: ModerationLogItem) => setDetail((d) => (d ? { ...d, ...item } : d))

  const place = detail ? placeOfContext(detail.context) : null
  const target = detail?.target

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={fmt(m.detailTitle, { id: logId })}>
      <div className="absolute inset-0 bg-black/35 backdrop-blur-xs animate-[fadeIn_150ms_ease-out]" onClick={() => !modalOpen && onClose()} />

      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-[slideIn_200ms_ease-out]">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {fmt(m.detailTitle, { id: logId })}
              {detail && <Badge title={L.status(detail.reviewStatus)} type={statusBadgeType(detail.reviewStatus)} showDot />}
            </h3>
            {detail && (
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                {place && <span className="font-semibold text-gray-700">{L.place(place)}</span>}
                <span>{L.context(detail.context)}</span>
                <span>· {formatDateTime(detail.createdAt)}</span>
                {detail.isPrivate && (
                  <span className="inline-flex items-center gap-0.5 text-gray-500">
                    · <Lock className="w-3 h-3" /> {m.privateBadge}
                  </span>
                )}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={m.close}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {error && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <Button size="sm" variant="outline" onClick={reload} className="cursor-pointer">
                {m.retry}
              </Button>
            </div>
          )}

          {!detail && !error && (
            <div className="flex justify-center py-16 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {detail && (
            <>
              {result && (result.applied.length > 0 || result.warnings.length > 0 || result.cascadedIds.length > 0) && (
                <div className="space-y-2">
                  {result.applied.length > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <p className="font-bold flex items-center gap-1.5 mb-1">
                        <CheckCircle2 className="w-4 h-4" /> {m.resultApplied}
                      </p>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {result.applied.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.warnings.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      <p className="font-bold flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="w-4 h-4" /> {m.resultWarnings}
                      </p>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {result.warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.cascadedIds.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {fmt(m.resultCascaded, {
                        count: result.cascadedIds.length,
                        ids: result.cascadedIds.map((id) => `#${id}`).join(", "),
                      })}
                    </p>
                  )}
                </div>
              )}

              <Section title={m.sectionContent}>
                <ModerationContent detail={detail} onRevealed={handleRevealed} />
              </Section>

              <Section title={m.sectionAi}>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Field label={m.aiAction}>
                    <Badge title={L.aiAction(detail.action)} type={actionBadgeType(detail.action)} />
                  </Field>
                  <Field label={m.aiLabel}>{L.label(detail.violatedLabel)}</Field>
                  <Field label={m.aiScore}>{formatScore(detail.score)}</Field>
                  <Field label={m.aiModel}>
                    <span className="break-all">{detail.modelName || "—"}</span>
                  </Field>
                </div>
              </Section>

              <Section title={m.sectionTarget}>
                {!target ? (
                  <p className="text-sm text-gray-500">{m.targetNone}</p>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Field label={L.targetType(target.type)}>#{target.id}</Field>
                      {target.status && (
                        <Field label={m.targetStatus}>
                          {target.type === "reel" ? L.reelStatus(target.status) : target.status}
                        </Field>
                      )}
                      {target.createdAt && <Field label={m.colTime}>{formatDateTime(target.createdAt)}</Field>}
                    </div>
                    {!target.exists && <p className="text-sm text-red-600">{m.targetMissing}</p>}
                    {target.matched && (
                      <p className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {m.targetMatched}
                      </p>
                    )}
                    {(target.title || target.content) && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700 space-y-1">
                        {target.title && <p className="font-semibold text-gray-900">{target.title}</p>}
                        {target.content && <p className="whitespace-pre-wrap break-words line-clamp-6">{target.content}</p>}
                      </div>
                    )}
                  </div>
                )}
              </Section>

              <Section title={m.sectionUser}>
                {detail.accountId ? (
                  <UserHistoryCard
                    key={detail.accountId}
                    accountId={detail.accountId}
                    currentLogId={detail.id}
                    onFilterAccount={onFilterAccount}
                  />
                ) : (
                  <p className="text-sm text-gray-500">{m.noAccount}</p>
                )}
              </Section>

              {detail.revealCount > 0 && (
                <Section title={`${m.sectionReveals} (${detail.revealCount})`}>
                  <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 text-xs">
                    {(detail.reveals ?? []).map((r, i) => (
                      <li key={`${r.viewerId}-${r.createdAt}-${i}`} className="flex items-center gap-3 px-3 py-2">
                        <span className="font-semibold text-gray-700 whitespace-nowrap">{fmt(m.revealBy, { id: r.viewerId })}</span>
                        <span className="text-gray-400 whitespace-nowrap">{formatDateTime(r.createdAt)}</span>
                        <span className="flex-1 truncate text-gray-600" title={r.reason ?? ""}>
                          {r.reason || m.noReason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section title={m.sectionDecision}>
                {detail.reviewStatus !== "pending" && !editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <Field label={m.colStatus}>
                        <Badge title={L.status(detail.reviewStatus)} type={statusBadgeType(detail.reviewStatus)} showDot />
                      </Field>
                      <Field label={m.userAction}>{L.userAction(detail.userAction)}</Field>
                      <Field label={m.humanLabel}>{L.label(detail.humanLabel)}</Field>
                    </div>
                    {detail.decidedBy != null && (
                      <p className="text-xs text-gray-500">
                        {fmt(m.decidedBy, { id: detail.decidedBy, time: formatDateTime(detail.decidedAt) })}
                      </p>
                    )}
                    {detail.decisionNote && (
                      <Field label={m.note}>
                        <span className="whitespace-pre-wrap font-normal">{detail.decisionNote}</span>
                      </Field>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="cursor-pointer">
                      {m.changeDecision}
                    </Button>
                  </div>
                ) : (
                  <DecisionForm
                    key={`${detail.id}-${detail.reviewStatus}-${editing}`}
                    detail={detail}
                    override={editing}
                    onDone={handleDone}
                    onCancel={editing ? () => setEditing(false) : undefined}
                    onConflict={reload}
                    onModalChange={setModalOpen}
                  />
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
