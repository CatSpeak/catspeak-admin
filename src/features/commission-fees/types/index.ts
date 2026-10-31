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

export interface TuitionFeeConfig {
  baseFee: number;
  perSessionFee: number;
  updatedAt?: string | null;
}

export interface UpdateTuitionFeeConfigRequest {
  baseFee: number;
  perSessionFee: number;
}
