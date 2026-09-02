import { axiosClient, getResponseData } from "../../../lib/axios";

export interface UnlockUserResponse {
  message: string;
  wasLocked: boolean;
}

export const unlockUser = async (
  userId: number,
  reason?: string,
): Promise<UnlockUserResponse> => {
  return getResponseData(
    axiosClient.post<UnlockUserResponse>(`/Admin/users/${userId}/unlock`, {
      reason,
    }),
  );
};
