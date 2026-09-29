import { useState } from "react"
import { Coins, Plus } from "lucide-react"
import { PageHeader } from "../../../components/ui/PageHeader"
import Button from "../../../components/ui/Button"
import Tabs, { type Tab } from "../../../components/ui/Tabs"
import { useLanguage } from "../../../stores/languageStore"
import type {
  PointRedemptionItemDto,
  PointRedemptionHistoryDto,
} from "../types"
import CatalogTab from "../components/tabs/CatalogTab"
import HistoryTab from "../components/tabs/HistoryTab"
import ReportsTab from "../components/tabs/ReportsTab"
import CreateExchangeItemModal from "../components/CreateExchangeItemModal"
import TransactionDetailModal from "../components/TransactionDetailModal"

export default function PointRewardsPage() {
  const { t } = useLanguage()

  // Tabs state
  const [activeTab, setActiveTab] = useState<string>("catalog")

  // Catalog signals & editing state
  const [catalogRefreshSignal, setCatalogRefreshSignal] = useState(0)
  const [editingItem, setEditingItem] = useState<PointRedemptionItemDto | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // History detail state
  const [selectedTransaction, setSelectedTransaction] =
    useState<PointRedemptionHistoryDto | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Tab definitions
  const tabs: Tab[] = [
    { id: "catalog", label: t.pointRewards.tabs.catalog },
    { id: "history", label: t.pointRewards.tabs.history },
    { id: "reports", label: t.pointRewards.tabs.reports },
  ]

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setIsCreateModalOpen(true)
  }

  const handleEditItem = (item: PointRedemptionItemDto) => {
    setEditingItem(item)
    setIsCreateModalOpen(true)
  }

  const handleSavedSuccess = () => {
    setCatalogRefreshSignal((prev) => prev + 1)
  }

  const handleViewTransaction = (tx: PointRedemptionHistoryDto) => {
    setSelectedTransaction(tx)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        icon={<Coins className="size-5" />}
        title={t.pointRewards.pageTitle}
        desc={t.pointRewards.pageDesc}
        rightButtons={[
          <Button
            key="create-exchange-item"
            variant="primary"
            size="sm"
            onClick={handleOpenCreateModal}
            className="cursor-pointer"
          >
            <Plus className="size-4 mr-1" />
            {t.pointRewards.btnCreate}
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
          onEditItem={handleEditItem}
          refreshSignal={catalogRefreshSignal}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab onViewTransaction={handleViewTransaction} />
      )}

      {activeTab === "reports" && (
        <ReportsTab onViewAll={() => setActiveTab("catalog")} />
      )}

      {/* ── Modals ── */}
      <CreateExchangeItemModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingItem(null)
        }}
        editingItem={editingItem}
        onSuccess={handleSavedSuccess}
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
