import { axiosClient, getResponseData } from "../../../lib/axios"
import type {
  PointRedemptionItemDto,
  UpdatePointRedemptionItemRequest,
} from "../types"

/**
 * Cập nhật thông tin mục đổi điểm (VoucherId không được phép thay đổi).
 * PUT /admin/point-redemptions/{id}
 */
export const updatePointRedemptionItem = async (
  id: number,
  payload: UpdatePointRedemptionItemRequest,
): Promise<PointRedemptionItemDto> => {
  return getResponseData(
    axiosClient.put<PointRedemptionItemDto>(
      `/admin/point-redemptions/${id}`,
      payload,
    ),
  )
}
