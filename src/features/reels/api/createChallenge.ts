import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ChallengeCreateDto, ChallengeResponseDto } from "../types";

/**
 * Create a new vocabulary/pronunciation challenge with dynamic status.
 * Uses multipart/form-data as per backend API spec.
 */
export const createChallenge = async (
  payload: ChallengeCreateDto
): Promise<ChallengeResponseDto> => {
  const formData = new FormData();
  formData.append("Hashtag", payload.hashtag);
  formData.append("Name", payload.name);
  formData.append("Description", payload.description);
  if (payload.bannerFile) {
    formData.append("BannerFile", payload.bannerFile);
  }
  formData.append("StartDate", payload.startDate);
  formData.append("EndDate", payload.endDate);

  return getResponseData(
    axiosClient.post<ChallengeResponseDto>("/ReelsAdmin/challenges", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};
