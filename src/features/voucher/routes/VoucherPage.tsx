import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Ticket, CheckCircle2, Ban, FileEdit, Layers, Plus } from "lucide-react"
import { PageHeader } from "../../../components/ui/PageHeader"
import Button from "../../../components/ui/Button"
import SummaryCard from "../../../components/ui/SummaryCard"
import { getVoucherStats } from "../api/getVoucherStats"
import type { VoucherStats } from "../types"
import { useLanguage } from "../../../stores/languageStore"
import VoucherTable from "../components/table/VoucherTable"

export default function VoucherPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [stats, setStats] = useState<VoucherStats | null>(null)
  const [statsLoading, setStatsLoading] = useState<boolean>(true)

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true)
      const data = await getVoucherStats()
      setStats(data)
    } catch (error) {
      console.error("Failed to load voucher statistics:", error)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        icon={<Ticket />}
        title={t.vouchers.title}
        desc={t.vouchers.desc}
        rightButtons={[
          <Button
            key="create-voucher"
            variant="primary"
            size="sm"
            onClick={() => navigate("/voucher/create")}
          >
            <Plus className="size-4 mr-1" />
            {t.vouchers.createBtn || "Tạo voucher mới"}
          </Button>,
        ]}
      />

      {/* ── 4 KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={<Layers size={20} />}
          color="#2563EB"
          label={t.vouchers.total}
          value={stats?.total ?? 0}
          loading={statsLoading}
        />
        <SummaryCard
          icon={<CheckCircle2 size={20} />}
          color="#059669"
          label={t.vouchers.active}
          value={stats?.active ?? 0}
          loading={statsLoading}
        />
        <SummaryCard
          icon={<Ban size={20} />}
          color="#DC2626"
          label={t.vouchers.expiredAndDisabled}
          value={(stats?.disabled ?? 0) + (stats?.expired ?? 0)}
          subtitle={`${stats?.disabled ?? 0} ${t.vouchers.disabled.toLowerCase()} · ${stats?.expired ?? 0} ${t.vouchers.expired.toLowerCase()}`}
          loading={statsLoading}
        />
        <SummaryCard
          icon={<FileEdit size={20} />}
          color="#D97706"
          label={t.vouchers.draftOrPending}
          value={stats?.draft ?? 0}
          subtitle={`${stats?.pendingApproval ?? 0} ${t.vouchers.statuses.pendingApproval.toLowerCase()}`}
          loading={statsLoading}
        />
      </div>

      {/* ── Vouchers Table Component ── */}
      <VoucherTable onRefreshStats={fetchStats} />
    </div>
  )
}
