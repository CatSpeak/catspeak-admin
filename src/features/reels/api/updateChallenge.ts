import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ChallengeCreateDto, ChallengeResponseDto } from "../types";

/**
 * Update an existing challenge's dates, status, name, and descriptions.
 */
export const updateChallenge = async (
  challengeId: number,
  payload: ChallengeCreateDto
): Promise<ChallengeResponseDto> => {
  return getResponseData(
    axiosClient.put<ChallengeResponseDto>(
      `/ReelsAdmin/challenges/${challengeId}`,
      payload
    )
  );
};
