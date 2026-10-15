import { AlertCircle, CheckCheck, Clock3, ShieldAlert, Target } from "lucide-react"
import SummaryCard from "../../../components/ui/SummaryCard"
import { useLanguage } from "../../../stores/languageStore"
import type { ModerationStats } from "../types"
import { fmt, formatRate } from "../utils/moderation"

interface ModerationSummaryCardsProps {
  stats: ModerationStats | null
  loading: boolean
  error?: string | null
}

export default function ModerationSummaryCards({ stats, loading, error }: ModerationSummaryCardsProps) {
  const { t } = useLanguage()
  const m = t.contentModeration
  const days = stats?.days ?? 7
  const byStatus = stats?.byStatus ?? {}
  const byAction = stats?.byAction ?? {}
  const allowed = byStatus.allowed ?? 0
  const confirmed = byStatus.confirmed ?? 0
  const removed = byStatus.removed ?? 0

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Clock3 size={20} />}
          label={m.statPending}
          value={(stats?.pendingTotal ?? 0).toLocaleString()}
          subtitle={m.statPendingSub}
          loading={loading}
          iconClassName="text-amber-600"
          iconContainerClassName="bg-amber-50"
          className="border-amber-100"
        />
        <SummaryCard
          icon={<ShieldAlert size={20} />}
          label={fmt(m.statNew, { days })}
          value={(stats?.total ?? 0).toLocaleString()}
          subtitle={fmt(m.statNewSub, { block: byAction.block ?? 0, review: byAction.review ?? 0 })}
          loading={loading}
          iconClassName="text-red-600"
          iconContainerClassName="bg-red-50"
          className="border-red-100"
        />
        <SummaryCard
          icon={<CheckCheck size={20} />}
          label={fmt(m.statDecided, { days })}
          value={(allowed + confirmed + removed).toLocaleString()}
          subtitle={fmt(m.statDecidedSub, { allowed, confirmed, removed })}
          loading={loading}
          iconClassName="text-blue-600"
          iconContainerClassName="bg-blue-50"
          className="border-blue-100"
        />
        <SummaryCard
          icon={<Target size={20} />}
          label={m.statFalsePositive}
          value={formatRate(stats?.falsePositiveRate)}
          subtitle={fmt(m.statFalsePositiveSub, { days })}
          loading={loading}
          iconClassName="text-emerald-600"
          iconContainerClassName="bg-emerald-50"
          className="border-emerald-100"
        />
      </div>
    </div>
  )
}
