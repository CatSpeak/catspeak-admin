import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ChallengeCreateDto, ChallengeResponseDto } from "../types";

/**
 * Update an existing challenge's dates, status, name, and descriptions.
 * Uses multipart/form-data as per backend API spec.
 */
export const updateChallenge = async (
  challengeId: number,
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
    axiosClient.put<ChallengeResponseDto>(
      `/api/admin/challenges/${challengeId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
  );
};
