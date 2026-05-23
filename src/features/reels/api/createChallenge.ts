import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ChallengeCreateDto, ChallengeResponseDto } from "../types";

/**
 * Create a new vocabulary/pronunciation challenge with dynamic status.
 */
export const createChallenge = async (
  payload: ChallengeCreateDto
): Promise<ChallengeResponseDto> => {
  return getResponseData(
    axiosClient.post<ChallengeResponseDto>("/ReelsAdmin/challenges", payload)
  );
};
