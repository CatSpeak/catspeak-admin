import { useState } from "react"
import axios from "axios"
import { AlertTriangle, Info, Trash2 } from "lucide-react"
import Button from "../../../components/ui/Button"
import { ConfirmModal } from "../../../components/ui/ConfirmModal"
import { getApiErrorMessage } from "../../../lib/axios"
import { useToastStore } from "../../../stores/toastStore"
import { decideModerationLog } from "../api/contentModeration"
import { useModerationLabels } from "../hooks/useModerationLabels"
import type { Decision, DecisionResponse, ModerationLogDetail, UserAction } from "../types"
import { HUMAN_LABELS, defaultHumanLabel, fmt, isHeldReel, needsConfirmation } from "../utils/moderation"

interface DecisionFormProps {
  detail: ModerationLogDetail
  /** Đổi quyết định của một ca đã duyệt. */
  override?: boolean
  onDone: (res: DecisionResponse) => void
  onCancel?: () => void
  /** Ca vừa bị người khác duyệt (409): cha tải lại chi tiết. */
  onConflict?: () => void
  onModalChange?: (open: boolean) => void
}

interface Option {
  value: Decision
  title: string
  desc: string
  disabled?: boolean
  tone: "green" | "amber" | "red"
}

const toneClass: Record<Option["tone"], string> = {
  green: "border-emerald-500 bg-emerald-50/60 ring-emerald-500/20",
  amber: "border-amber-500 bg-amber-50/60 ring-amber-500/20",
  red: "border-red-500 bg-red-50/60 ring-red-500/20",
}

const inputClass =
  "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20"

export default function DecisionForm({
  detail,
  override = false,
  onDone,
  onCancel,
  onConflict,
  onModalChange,
}: DecisionFormProps) {
  const L = useModerationLabels()
  const m = L.m
  const { addToast } = useToastStore()

  const [decision, setDecision] = useState<Decision | null>(null)
  const [userAction, setUserAction] = useState<UserAction>("none")
  const [label, setLabel] = useState<string | null>(null)
  const [note, setNote] = useState("")
  const [warning, setWarning] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const held = isHeldReel(detail)
  const target = detail.target
  const canRemove = !!target?.exists && target.type !== "rag_query"
  const isText = detail.contentKind === "text"
  const removeHint = (m.removeHints as Record<string, string>)[canRemove ? target!.type : "none"] ?? m.removeHints.none

  const options: Option[] = held
    ? [
        { value: "allowed", title: m.decisionPublish, desc: m.decisionPublishDesc, tone: "green" },
        { value: "confirmed", title: m.decisionReject, desc: m.decisionRejectDesc, tone: "red" },
      ]
    : [
        { value: "allowed", title: m.decisionAllow, desc: isText ? m.decisionAllowText : m.decisionAllowMedia, tone: "green" },
        { value: "confirmed", title: m.decisionConfirm, desc: isText ? m.decisionConfirmText : m.decisionConfirmMedia, tone: "amber" },
        { value: "removed", title: m.decisionRemove, desc: removeHint, tone: "red", disabled: !canRemove },
      ]

  const noAccount = !detail.accountId
  const actionLocked = decision === "allowed" || noAccount
  const effectiveAction: UserAction = actionLocked ? "none" : userAction
  // Nhãn điền sẵn theo quyết định; admin chọn tay thì giữ lựa chọn của admin.
  const humanLabel = label ?? (decision ? defaultHumanLabel(decision, detail.contentKind, detail.violatedLabel) : "")

  const setModal = (open: boolean) => {
    setConfirmOpen(open)
    onModalChange?.(open)
  }

  const send = async () => {
    if (!decision) return
    setBusy(true)
    try {
      const res = await decideModerationLog(detail.id, {
        status: decision,
        userAction: effectiveAction,
        humanLabel: humanLabel || undefined,
        note: note.trim() || undefined,
        warningMessage: effectiveAction === "warn" ? warning.trim() || undefined : undefined,
        override,
      })
      setModal(false)
      addToast("success", fmt(m.decideSuccess, { id: detail.id }))
      onDone(res)
    } catch (err) {
      setModal(false)
      setBusy(false)
      addToast("error", getApiErrorMessage(err, m.decideFailed))
      if (axios.isAxiosError(err) && err.response?.status === 409) onConflict?.()
    }
  }

  // Từ chối reel đang giữ cũng xóa file, nên hỏi lại như khi gỡ.
  const rejectingHeld = held && decision === "confirmed"
  const removing = decision === "removed" || rejectingHeld
  const locking = effectiveAction === "lock"

  const submit = () => {
    if (!decision) return
    if (rejectingHeld || needsConfirmation(decision, effectiveAction)) setModal(true)
    else void send()
  }

  return (
    <div className="space-y-5">
      {override && (
        <p className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {m.overrideNotice}
        </p>
      )}
      {held && (
        <p className="flex items-start gap-2 text-xs text-violet-800 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
          <Info className="w-4 h-4 shrink-0" />
          {m.heldReelNotice}
        </p>
      )}

      <div role="radiogroup" className={`grid gap-2 ${options.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {options.map((o) => {
          const active = decision === o.value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={o.disabled || busy}
              onClick={() => setDecision(o.value)}
              className={`text-left rounded-xl border p-3 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                active ? `${toneClass[o.tone]} ring-2` : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <p className="text-sm font-bold text-gray-900">{o.title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-snug">{o.desc}</p>
            </button>
          )
        })}
      </div>

      {decision && (
        <>
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-gray-600 mb-2">{m.userActionTitle}</legend>
            <div className="flex flex-wrap gap-2">
              {(["none", "warn", "lock"] as const).map((a) => {
                const active = effectiveAction === a
                const title = a === "none" ? m.userActionNone : a === "warn" ? m.userActionWarn : m.userActionLock
                return (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={active}
                    disabled={busy || (actionLocked && a !== "none")}
                    onClick={() => setUserAction(a)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                      active
                        ? a === "lock"
                          ? "bg-red-600 text-white border-red-600"
                          : a === "warn"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-gray-800 text-white border-gray-800"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {title}
                  </button>
                )
              })}
            </div>
            {actionLocked && (
              <p className="text-xs text-gray-400">{noAccount ? m.userActionNoAccount : m.userActionAllowedHint}</p>
            )}
          </fieldset>

          {effectiveAction === "warn" && (
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-600">{m.warningMessage}</span>
              <textarea
                value={warning}
                maxLength={500}
                rows={2}
                onChange={(e) => setWarning(e.target.value)}
                placeholder={m.warningPlaceholder}
                className={inputClass}
              />
            </label>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-600">{m.humanLabelTitle}</span>
              <select value={humanLabel} onChange={(e) => setLabel(e.target.value)} disabled={busy} className={inputClass}>
                <option value="">{m.humanLabelNone}</option>
                {HUMAN_LABELS[detail.contentKind].map((lb) => (
                  <option key={lb} value={lb}>
                    {L.label(lb)}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-gray-400">{m.humanLabelHint}</span>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-gray-600">{m.noteTitle}</span>
              <textarea
                value={note}
                maxLength={500}
                rows={2}
                onChange={(e) => setNote(e.target.value)}
                placeholder={m.notePlaceholder}
                className={inputClass}
              />
            </label>
          </div>

          {decision === "allowed" && isText && detail.isPrivate && (
            <p className="text-xs text-gray-500">{m.privateRestoreNotice}</p>
          )}
        </>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="outline" size="sm" disabled={busy} onClick={onCancel} className="cursor-pointer">
            {m.cancelChange}
          </Button>
        )}
        <Button
          size="sm"
          variant={removing || locking ? "danger" : "primary"}
          disabled={!decision}
          isLoading={busy && !confirmOpen}
          onClick={submit}
          className="cursor-pointer"
        >
          {m.submit}
        </Button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => !busy && setModal(false)}
        onConfirm={send}
        title={removing ? (rejectingHeld ? `${m.decisionReject}?` : m.confirmRemoveTitle) : fmt(m.confirmLockTitle, { id: detail.accountId ?? "" })}
        description={
          <div className="space-y-2">
            {removing && <p>{rejectingHeld ? m.decisionRejectDesc : m.confirmRemoveDesc}</p>}
            {locking && (
              <p>
                {removing && <strong>{fmt(m.confirmLockTitle, { id: detail.accountId ?? "" })} </strong>}
                {m.confirmLockDesc}
              </p>
            )}
          </div>
        }
        confirmText={m.confirm}
        cancelText={m.cancel}
        variant="danger"
        icon={locking ? undefined : <Trash2 className="w-6 h-6 text-red-600" />}
        isLoading={busy}
      />
    </div>
  )
}
