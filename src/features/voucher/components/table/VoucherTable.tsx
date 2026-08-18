import { useCallback, useEffect, useMemo, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Table from "../../../../components/ui/table/Table"
import type { TableHeader } from "../../../../components/ui/table/types"
import { getVouchers } from "../../api/getVouchers"
import { activateVoucher } from "../../api/activateVoucher"
import { disableVoucher } from "../../api/disableVoucher"
import { extendVoucher } from "../../api/extendVoucher"
import { increaseVoucherLimit } from "../../api/increaseVoucherLimit"
import { deleteVoucher } from "../../api/deleteVoucher"
import { approveVoucherDeposit } from "../../api/approveVoucherDeposit"
import { rejectVoucher } from "../../api/rejectVoucher"
import type { VoucherListItem, GetVouchersParams } from "../../types"
import { useLanguage } from "../../../../stores/languageStore"
import ActivateVoucherModal from "../ActivateVoucherModal"
import DisableVoucherModal from "../DisableVoucherModal"
import ExtendVoucherModal from "../ExtendVoucherModal"
import IncreaseLimitModal from "../IncreaseLimitModal"
import DeleteVoucherModal from "../DeleteVoucherModal"
import ApproveDepositModal from "../ApproveDepositModal"
import RejectVoucherModal from "../RejectVoucherModal"
import {
  getVoucherTableHeaders,
  getRowActions,
  getStatusBadgeConfig,
} from "./tableConfigs"

export interface VoucherTableProps {
  onRefreshStats?: () => void
}

export default function VoucherTable({ onRefreshStats }: VoucherTableProps) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [tableKey, setTableKey] = useState<number>(0)

  // Active Dropdown state for row actions
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Selected voucher for modals
  const [selectedVoucher, setSelectedVoucher] =
    useState<VoucherListItem | null>(null)

  // Modals visibility state
  const [showActivateModal, setShowActivateModal] = useState<boolean>(false)
  const [showDisableModal, setShowDisableModal] = useState<boolean>(false)
  const [showExtendModal, setShowExtendModal] = useState<boolean>(false)
  const [showIncreaseLimitModal, setShowIncreaseLimitModal] =
    useState<boolean>(false)
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
  const [showApproveDepositModal, setShowApproveDepositModal] =
    useState<boolean>(false)
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const refreshTableAndStats = useCallback(() => {
    setTableKey((k) => k + 1)
    if (onRefreshStats) {
      onRefreshStats()
    }
  }, [onRefreshStats])

  // Table Data Fetcher with Server-side Pagination
  const fetcher = useCallback(
    async (page: number = 1, pageSize: number = 10) => {
      const res = await getVouchers({ page, pageSize })
      return {
        data: res.data,
        total: res.pagination?.total ?? res.data.length,
      }
    },
    [],
  )

  // Table Filters (Global Search & Single Choice Filters)
  const filter = useCallback(async (attribute: string, value: unknown) => {
    const params: GetVouchersParams = {}

    if (attribute === "global") {
      params.search = value ? String(value) : undefined
    } else if (attribute === "status" && value) {
      params.status = Array.isArray(value) ? String(value[0]) : String(value)
    } else if (attribute === "discountType" && value) {
      params.discountType = Array.isArray(value)
        ? String(value[0])
        : String(value)
    } else if (attribute === "sponsorType" && value) {
      params.sponsorType = Array.isArray(value)
        ? String(value[0])
        : String(value)
    }

    const res = await getVouchers(params)
    return {
      data: res.data,
      total: res.pagination?.total ?? res.data.length,
    }
  }, [])

  // Status Badge Config wrapper
  const handleGetBadgeConfig = useCallback(
    (status: string) => getStatusBadgeConfig(status, t.vouchers.statuses),
    [t.vouchers.statuses],
  )

  // Row Actions Config wrapper
  const handleGetRowActions = useCallback(
    (row: VoucherListItem) =>
      getRowActions({
        row,
        navigate,
        onOpenActivate: (v) => {
          setSelectedVoucher(v)
          setShowActivateModal(true)
        },
        onOpenDisable: (v) => {
          setSelectedVoucher(v)
          setShowDisableModal(true)
        },
        onOpenExtend: (v) => {
          setSelectedVoucher(v)
          setShowExtendModal(true)
        },
        onOpenIncreaseLimit: (v) => {
          setSelectedVoucher(v)
          setShowIncreaseLimitModal(true)
        },
        onOpenDelete: (v) => {
          setSelectedVoucher(v)
          setShowDeleteModal(true)
        },
        onOpenApproveDeposit: (v) => {
          setSelectedVoucher(v)
          setShowApproveDepositModal(true)
        },
        onOpenReject: (v) => {
          setSelectedVoucher(v)
          setShowRejectModal(true)
        },
      }),
    [navigate],
  )

  // Table Columns Definition using extracted tableConfigs
  const headers: TableHeader<VoucherListItem>[] = useMemo(
    () =>
      getVoucherTableHeaders({
        vouchersText: t.vouchers,
        openDropdownId,
        setOpenDropdownId,
        dropdownRef,
        getRowActions: handleGetRowActions,
        getStatusBadgeConfig: handleGetBadgeConfig,
      }),
    [t.vouchers, openDropdownId, handleGetRowActions, handleGetBadgeConfig],
  )

  return (
    <>
      <Table<VoucherListItem>
        key={tableKey}
        fetcher={fetcher}
        filter={filter}
        headers={headers}
        onClickRow={(row) => navigate(`/voucher/${row.id}`)}
        showGlobalSearch={true}
        defaultPageSize={10}
        choiceMode="single"
      />

      {/* ── Action Modals ── */}
      <ActivateVoucherModal
        isOpen={showActivateModal}
        voucher={selectedVoucher}
        onClose={() => setShowActivateModal(false)}
        onConfirm={async () => {
          if (selectedVoucher) {
            await activateVoucher(selectedVoucher.id)
            refreshTableAndStats()
          }
        }}
      />

      <DisableVoucherModal
        isOpen={showDisableModal}
        voucher={selectedVoucher}
        onClose={() => setShowDisableModal(false)}
        onConfirm={async () => {
          if (selectedVoucher) {
            await disableVoucher(selectedVoucher.id)
            refreshTableAndStats()
          }
        }}
      />

      <ExtendVoucherModal
        isOpen={showExtendModal}
        voucher={selectedVoucher}
        onClose={() => setShowExtendModal(false)}
        onConfirm={async (validTo: string) => {
          if (selectedVoucher) {
            await extendVoucher(selectedVoucher.id, { newValidTo: validTo })
            refreshTableAndStats()
          }
        }}
      />

      <IncreaseLimitModal
        isOpen={showIncreaseLimitModal}
        voucher={selectedVoucher}
        onClose={() => setShowIncreaseLimitModal(false)}
        onConfirm={async (additionalLimit: number) => {
          if (selectedVoucher) {
            await increaseVoucherLimit(selectedVoucher.id, { additionalLimit })
            refreshTableAndStats()
          }
        }}
      />

      <DeleteVoucherModal
        isOpen={showDeleteModal}
        voucher={selectedVoucher}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (selectedVoucher) {
            await deleteVoucher(selectedVoucher.id)
            refreshTableAndStats()
          }
        }}
      />

      <ApproveDepositModal
        isOpen={showApproveDepositModal}
        voucher={selectedVoucher}
        onClose={() => setShowApproveDepositModal(false)}
        onConfirm={async () => {
          if (selectedVoucher) {
            await approveVoucherDeposit(selectedVoucher.id)
            refreshTableAndStats()
          }
        }}
      />

      <RejectVoucherModal
        isOpen={showRejectModal}
        voucher={selectedVoucher}
        onClose={() => setShowRejectModal(false)}
        onConfirm={async (reason: string, note?: string) => {
          if (selectedVoucher) {
            await rejectVoucher(selectedVoucher.id, { reason, note })
            refreshTableAndStats()
          }
        }}
      />
    </>
  )
}
