import { useState } from "react"
import { Eye, EyeOff, ExternalLink, ImageOff, Lock, ShieldAlert } from "lucide-react"
import Button from "../../../components/ui/Button"
import { getApiErrorMessage } from "../../../lib/axios"
import { useToastStore } from "../../../stores/toastStore"
import { revealModerationLog } from "../api/contentModeration"
import { useModerationLabels } from "../hooks/useModerationLabels"
import type { ModerationLogDetail, ModerationLogItem } from "../types"

interface ModerationContentProps {
  detail: ModerationLogDetail
  onRevealed: (item: ModerationLogItem) => void
}

const TextBox = ({ label, text, tone }: { label: string; text?: string | null; tone: "original" | "masked" }) => (
  <div className="space-y-1.5">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
    <p
      className={`text-sm leading-relaxed whitespace-pre-wrap break-words rounded-xl border p-4 ${
        tone === "original" ? "bg-amber-50/40 border-amber-100 text-gray-900" : "bg-gray-50 border-gray-100 text-gray-700"
      }`}
    >
      {text || "—"}
    </p>
  </div>
)

function MediaPreview({ detail }: { detail: ModerationLogDetail }) {
  const L = useModerationLabels()
  const m = L.m
  const url = detail.mediaUrl
  const showCover = detail.contentKind === "video" && detail.coverUrl

  return (
    <div className="space-y-3">
      {detail.mediaQuarantined && (
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 rounded-xl px-3 py-2">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          {m.mediaQuarantined}
        </div>
      )}
      {!url ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-4">
          <ImageOff className="w-4 h-4" />
          {m.mediaMissing}
        </div>
      ) : detail.contentKind === "video" ? (
        <video src={url} controls preload="metadata" className="w-full max-h-[420px] rounded-xl bg-black" />
      ) : (
        <img src={url} alt={L.context(detail.context)} className="w-full max-h-[420px] object-contain rounded-xl bg-gray-100" />
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        {detail.originalText && (
          <span>
            {m.fileName}: <span className="font-medium text-gray-700 break-all">{detail.originalText}</span>
          </span>
        )}
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
            {m.openInNewTab}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      {showCover && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">{m.cover}</span>
          <img src={detail.coverUrl!} alt={m.cover} className="h-40 rounded-xl object-cover bg-gray-100" />
        </div>
      )}
    </div>
  )
}

/** Nội dung của ca. Ca riêng tư chỉ hiện bản che cho tới khi admin chủ động xem nguyên văn. */
export default function ModerationContent({ detail, onRevealed }: ModerationContentProps) {
  const L = useModerationLabels()
  const m = L.m
  const { addToast } = useToastStore()
  const [asking, setAsking] = useState(false)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)

  if (detail.contentKind !== "text") return <MediaPreview detail={detail} />

  const original = detail.originalText
  const masked = detail.maskedText

  if (!detail.isPrivate) {
    return (
      <div className="space-y-4">
        <TextBox label={m.originalText} text={original ?? detail.text} tone="original" />
        {masked && masked !== original && <TextBox label={m.maskedText} text={masked} tone="masked" />}
      </div>
    )
  }

  if (original != null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <Eye className="w-3.5 h-3.5 shrink-0" />
          {m.revealedNotice}
        </div>
        <TextBox label={m.originalText} text={original} tone="original" />
        <TextBox label={m.maskedText} text={masked} tone="masked" />
      </div>
    )
  }

  const reveal = async () => {
    setBusy(true)
    try {
      onRevealed(await revealModerationLog(detail.id, reason))
    } catch (err) {
      addToast("error", getApiErrorMessage(err, m.revealFailed))
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
        <EyeOff className="w-3.5 h-3.5 shrink-0" />
        {m.privateNotice}
      </div>
      <TextBox label={m.maskedText} text={masked ?? detail.text} tone="masked" />

      {!asking ? (
        <Button variant="outline" size="sm" onClick={() => setAsking(true)} leftIcon={<Eye className="w-4 h-4" />} className="cursor-pointer">
          {m.revealButton}
        </Button>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
          <p className="flex items-start gap-2 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {m.revealAudit}
          </p>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-gray-600">{m.revealReason}</span>
            <input
              value={reason}
              maxLength={200}
              onChange={(e) => setReason(e.target.value)}
              placeholder={m.revealReasonPlaceholder}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setAsking(false)} className="cursor-pointer">
              {m.cancel}
            </Button>
            <Button size="sm" isLoading={busy} onClick={reveal} leftIcon={<Eye className="w-4 h-4" />} className="cursor-pointer">
              {m.revealConfirm}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
