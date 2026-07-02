import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ActionResponseDto, WarnOrBlockReelDto } from "../types";

/**
 * Update the status of a Reel (e.g. warn, block, toggle Public/Private).
 * Uses query parameters as per backend API spec.
 */
export const updateReelStatus = async (
  reelId: number,
  payload: WarnOrBlockReelDto
): Promise<ActionResponseDto> => {
  return getResponseData(
    axiosClient.post<ActionResponseDto>(
      `/api/admin/reels/${reelId}/status`,
      null,
      {
        params: {
          status: payload.status,
          blockReason: payload.blockReason || undefined,
        },
      }
    )
  );
};
