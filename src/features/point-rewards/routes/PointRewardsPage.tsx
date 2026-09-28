import { useState } from "react"
import { Coins, Plus } from "lucide-react"
import { PageHeader } from "../../../components/ui/PageHeader"
import Button from "../../../components/ui/Button"
import Tabs, { type Tab } from "../../../components/ui/Tabs"
import { useToastStore } from "../../../stores/toastStore"
import {
  INITIAL_CATALOG_STATS,
  INITIAL_EXCHANGE_ITEMS,
  INITIAL_TRANSACTIONS,
  INITIAL_REPORT_STATS,
  INITIAL_REWARD_PERFORMANCE,
} from "../api/mockData"
import type {
  ExchangeItem,
  ExchangeTransaction,
  CatalogStats,
  ReportStats,
  RewardPerformance,
} from "../types"
import CatalogTab from "../components/tabs/CatalogTab"
import HistoryTab from "../components/tabs/HistoryTab"
import ReportsTab from "../components/tabs/ReportsTab"
import CreateExchangeItemModal from "../components/CreateExchangeItemModal"
import TransactionDetailModal from "../components/TransactionDetailModal"

export default function PointRewardsPage() {
  const { addToast } = useToastStore()

  // Tabs state
  const [activeTab, setActiveTab] = useState<string>("catalog")

  // State for Catalog
  const [items, setItems] = useState<ExchangeItem[]>(INITIAL_EXCHANGE_ITEMS)
  const [catalogStats, setCatalogStats] = useState<CatalogStats>(INITIAL_CATALOG_STATS)

  // State for History
  const [transactions] = useState<ExchangeTransaction[]>(INITIAL_TRANSACTIONS)
  const [selectedTransaction, setSelectedTransaction] =
    useState<ExchangeTransaction | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // State for Reports
  const [reportStats] = useState<ReportStats>(INITIAL_REPORT_STATS)
  const [performances] = useState<RewardPerformance[]>(INITIAL_REWARD_PERFORMANCE)

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Tab definitions
  const tabs: Tab[] = [
    { id: "catalog", label: "Danh mục đổi điểm" },
    { id: "history", label: "Lịch sử đổi điểm" },
    { id: "reports", label: "Báo cáo" },
  ]

  // Handlers
  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "active" ? "paused" : "active"
          addToast(
            "info",
            `Đã chuyển trạng thái mục sang "${nextStatus === "active" ? "Hoạt động" : "Tạm dừng"}"`,
          )
          return { ...item, status: nextStatus }
        }
        return item
      }),
    )

    setCatalogStats((prev) => {
      const target = items.find((i) => i.id === id)
      if (!target) return prev
      if (target.status === "active") {
        return {
          ...prev,
          activeItems: Math.max(0, prev.activeItems - 1),
          pausedItems: prev.pausedItems + 1,
        }
      } else {
        return {
          ...prev,
          activeItems: prev.activeItems + 1,
          pausedItems: Math.max(0, prev.pausedItems - 1),
        }
      }
    })
  }

  const handleCreatedItem = (newItem: ExchangeItem) => {
    setItems((prev) => [newItem, ...prev])
    setCatalogStats((prev) => ({
      ...prev,
      totalItems: prev.totalItems + 1,
      activeItems: prev.activeItems + 1,
    }))
  }

  const handleViewTransaction = (tx: ExchangeTransaction) => {
    setSelectedTransaction(tx)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header matching Figma ── */}
      <PageHeader
        icon={<Coins className="size-5" />}
        title="Quản lý Đổi điểm"
        desc="Quản lý, tạo và cấu hình điểm thưởng"
        rightButtons={[
          <Button
            key="create-exchange-item"
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="size-4 mr-1" />
            Tạo mục đổi điểm mới
          </Button>,
        ]}
      />

      {/* ── Tab Navigation ── */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ── Tab Content ── */}
      {activeTab === "catalog" && (
        <CatalogTab
          items={items}
          stats={catalogStats}
          onToggleStatus={handleToggleStatus}
          onEditItem={() => {
            setIsCreateModalOpen(true)
          }}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab
          transactions={transactions}
          onViewTransaction={handleViewTransaction}
        />
      )}

      {activeTab === "reports" && (
        <ReportsTab
          stats={reportStats}
          performances={performances}
          onViewAll={() => setActiveTab("catalog")}
        />
      )}

      {/* ── Modals ── */}
      <CreateExchangeItemModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreatedItem}
      />

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedTransaction(null)
        }}
        transaction={selectedTransaction}
      />
    </div>
  )
}
