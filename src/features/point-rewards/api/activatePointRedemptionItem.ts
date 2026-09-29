import { axiosClient, getResponseData } from "../../../lib/axios"
import type { PointRedemptionItemDto } from "../types"

/**
 * Kích hoạt lại mục đổi điểm (Bỏ tạm dừng / isPaused = false).
 * PATCH /admin/point-redemptions/{id}/activate
 */
export const activatePointRedemptionItem = async (
  id: number,
): Promise<PointRedemptionItemDto> => {
  return getResponseData(
    axiosClient.patch<PointRedemptionItemDto>(
      `/admin/point-redemptions/${id}/activate`,
    ),
  )
}
