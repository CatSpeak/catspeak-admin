import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ActionResponseDto } from "../types";

/**
 * Delete any Reel in the system by Admin override.
 */
export const deleteReel = async (reelId: number): Promise<ActionResponseDto> => {
  return getResponseData(
    axiosClient.delete<ActionResponseDto>(`/api/admin/reels/${reelId}`)
  );
};
