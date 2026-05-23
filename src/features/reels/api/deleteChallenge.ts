import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ActionResponseDto } from "../types";

/**
 * Delete a vocabulary/pronunciation challenge by ID.
 */
export const deleteChallenge = async (
  challengeId: number
): Promise<ActionResponseDto> => {
  return getResponseData(
    axiosClient.delete<ActionResponseDto>(
      `/ReelsAdmin/challenges/${challengeId}`
    )
  );
};
