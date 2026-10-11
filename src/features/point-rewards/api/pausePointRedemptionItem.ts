import { axiosClient, getResponseData } from "../../../lib/axios"
import type { PointRedemptionItemDto } from "../types"

/**
 * Tạm dừng mục đổi điểm (Chuyển trạng thái sang Paused / isPaused = true).
 * PATCH /admin/point-redemptions/{id}/pause
 */
export const pausePointRedemptionItem = async (
  id: number,
): Promise<PointRedemptionItemDto> => {
  return getResponseData(
    axiosClient.patch<PointRedemptionItemDto>(
      `/admin/point-redemptions/${id}/pause`,
    ),
  )
}
