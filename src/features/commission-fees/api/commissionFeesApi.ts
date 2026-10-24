import { axiosClient, getResponseData } from "../../../lib/axios";
import type { CommissionTierItem, BatchUpdateCommissionTiersRequest } from "../types";

export const getCommissionTiers = async (): Promise<CommissionTierItem[]> => {
  return getResponseData(
    axiosClient.get<CommissionTierItem[]>("/admin/commission-tiers")
  );
};

export const updateCommissionTiers = async (
  tiers: CommissionTierItem[]
): Promise<CommissionTierItem[]> => {
  const payload: BatchUpdateCommissionTiersRequest = {
    tiers: tiers.map((t) => ({
      id: t.id,
      minSlot: Number(t.minSlot),
      maxSlot: t.maxSlot !== null && t.maxSlot !== undefined ? Number(t.maxSlot) : null,
      openingFee: Number(t.openingFee),
      // Đảm bảo lưu decimal 0.0 - 1.0 vào backend
      commissionPercent:
        t.commissionPercent > 1.0 ? t.commissionPercent / 100 : t.commissionPercent,
    })),
  };

  return getResponseData(
    axiosClient.put<CommissionTierItem[]>("/admin/commission-tiers", payload)
  );
};
