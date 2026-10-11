import { axiosClient, getResponseData } from "../../../lib/axios"
import type {
  CreatePointRedemptionItemRequest,
  PointRedemptionItemDto,
} from "../types"

/**
 * Tạo mới một mục phần thưởng đổi điểm từ Voucher hợp lệ.
 * POST /admin/point-redemptions
 */
export const createPointRedemptionItem = async (
  payload: CreatePointRedemptionItemRequest,
): Promise<PointRedemptionItemDto> => {
  return getResponseData(
    axiosClient.post<PointRedemptionItemDto>(
      "/admin/point-redemptions",
      payload,
    ),
  )
}
