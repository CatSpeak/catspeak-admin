import { useState } from "react"
import { CheckCheck, X } from "lucide-react"
import Button from "../../../components/ui/Button"
import { ConfirmModal } from "../../../components/ui/ConfirmModal"
import { useLanguage } from "../../../stores/languageStore"
import { fmt } from "../utils/moderation"

interface BulkConfirmBarProps {
  count: number
  onClear: () => void
  onConfirm: () => Promise<void>
}

export default function BulkConfirmBar({ count, onClear, onConfirm }: BulkConfirmBarProps) {
  const { t } = useLanguage()
  const m = t.contentModeration
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  if (count === 0) return null

  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4 border border-gray-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label={m.clearSelection}
            title={m.clearSelection}
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold">{fmt(m.selectedCount, { count })}</span>
        </div>
        <Button
          size="sm"
          onClick={() => setOpen(true)}
          leftIcon={<CheckCheck className="w-4 h-4" />}
          className="cursor-pointer"
        >
          {m.bulkConfirm}
        </Button>
      </div>

      <ConfirmModal
        isOpen={open}
        onClose={() => !busy && setOpen(false)}
        onConfirm={confirm}
        title={fmt(m.bulkConfirmTitle, { count })}
        description={m.bulkConfirmDesc}
        confirmText={m.bulkConfirm}
        cancelText={m.cancel}
        variant="warning"
        isLoading={busy}
      />
    </>
  )
}
