export interface CommissionTierItem {
  id?: number;
  minSlot: number;
  maxSlot: number | null;
  openingFee: number;
  commissionPercent: number; // 0 - 100 dạng hiển thị trên UI hoặc 0.0 - 1.0 dạng raw
}

export interface BatchUpdateCommissionTiersRequest {
  tiers: {
    id?: number;
    minSlot: number;
    maxSlot: number | null;
    openingFee: number;
    commissionPercent: number;
  }[];
}
