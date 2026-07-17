import { axiosClient, getResponseData } from "../../../lib/axios";
import type { BanDuration } from "../types";

export const approveApplication = async (id: number): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/Admin/instructor-profiles/${id}/approve`),
  );
};

export const rejectApplication = async (
  id: number,
  reason: string,
  banDuration: BanDuration,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/Admin/instructor-profiles/${id}/reject`, {
      reason,
      banDuration,
    }),
  );
};

export const requestEditApplication = async (
  id: number,
  editNote: string,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/Admin/instructor-profiles/${id}/request-edit`, {
      editNote,
    }),
  );
};
