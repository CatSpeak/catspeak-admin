import { gatewayClient, getResponseData } from "../../../lib/axios"
import type { Plan } from "../../../entities/types"

export type PlanSortBy = "PlanName" | "Price" | "CreateDate"
export type SortOrder = "Asc" | "Desc"

export interface GetPlansParams {
  SearchKeyword?: string
  PlanName?: string
  PackageStatuses?: string[]
  BillingCycles?: string[]
  MinPrice?: number
  MaxPrice?: number
  SortBy?: PlanSortBy
  Page?: number
  PageSize?: number
  SortOrder?: SortOrder
}

export interface PlanResponse {
  data: Plan[]
  page: number
  pageSize: number
  total_records: number
}

export const getPlans = async (
  params: GetPlansParams = {},
): Promise<PlanResponse> => {
  return getResponseData(
    gatewayClient.get<PlanResponse>("/api/v1/Plans/admin/all", { params }),
  )
}
