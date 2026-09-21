import { axiosClient, getResponseData } from "../../../lib/axios";

export const approveLanguageRequest = async (id: number): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/Admin/language-requests/${id}/approve`),
  );
};

export const rejectLanguageRequest = async (
  id: number,
  reason: string,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/Admin/language-requests/${id}/reject`, {
      reason,
    }),
  );
};
