import { axiosClient, getResponseData } from "../../../lib/axios";
import type { AxiosProgressEvent } from "axios";
import type { ReelResponseDto, ReelPrivacy } from "../types";

export interface UploadReelApiPayload {
  Title: string;
  Description: string;
  Privacy: ReelPrivacy;
  VideoFile: File;
  CoverFile?: File | null;
  Tags?: string[];
}

/**
 * Upload an administrative Reel.
 * Sourced as CatSpeak, supports Private status.
 */
export const uploadReel = async (
  payload: UploadReelApiPayload,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
): Promise<ReelResponseDto> => {
  const formData = new FormData();
  formData.append("Title", payload.Title);
  formData.append("Description", payload.Description);
  formData.append("Privacy", payload.Privacy);
  formData.append("VideoFile", payload.VideoFile);

  if (payload.CoverFile) {
    formData.append("CoverFile", payload.CoverFile);
  }
  payload.Tags?.forEach((tag) => {
    formData.append("Tags", tag);
  });

  return getResponseData(
    axiosClient.post<ReelResponseDto>("/api/admin/reels", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    })
  );
};
