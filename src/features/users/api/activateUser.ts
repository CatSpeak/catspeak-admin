import { axiosClient, getResponseData } from "../../../lib/axios";

export interface ActivateUserResponse {
  message: string;
  wasActivated: boolean;
}

export const activateUser = async (
  userId: number,
  reason?: string,
): Promise<ActivateUserResponse> => {
  return getResponseData(
    axiosClient.post<ActivateUserResponse>(`/Admin/users/${userId}/activate`, {
      reason,
    }),
  );
};
