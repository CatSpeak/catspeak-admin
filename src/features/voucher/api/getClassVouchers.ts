import { axiosClient, getResponseData } from "../../../lib/axios"
import type { ClassVouchersResponse, GetClassVouchersParams } from "../types"

/**
 * Get applicable and categorized vouchers for a specific class checkout session.
 */
export const getClassVouchers = async (
  classId: number,
  params: GetClassVouchersParams = {},
): Promise<ClassVouchersResponse> => {
  const { learnersCount = 1, orderAmount } = params

  const queryParams: Record<string, unknown> = {
    learnersCount,
  }

  if (orderAmount !== undefined && orderAmount !== null) {
    queryParams.orderAmount = orderAmount
  }

  return getResponseData(
    axiosClient.get<ClassVouchersResponse>(`/vouchers/class/${classId}`, {
      params: queryParams,
    }),
  )
}
