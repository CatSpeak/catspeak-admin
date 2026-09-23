import { axiosClient, getResponseData } from "../../../lib/axios";
import type { BanDuration } from "../types";

export const approveRevision = async (id: number): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/Admin/instructor-revisions/${id}/approve`),
  );
};

export const rejectRevision = async (
  id: number,
  reason: string,
  banDuration: BanDuration,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/Admin/instructor-revisions/${id}/reject`, {
      reason,
      banDuration,
    }),
  );
};

export const requestEditRevision = async (
  id: number,
  editNote: string,
): Promise<void> => {
  await getResponseData(
    axiosClient.post<void>(`/Admin/instructor-revisions/${id}/request-edit`, {
      editNote,
    }),
  );
};

export const verifyInstructorIdCard = async (
  profileId: number,
): Promise<void> => {
  await getResponseData(
    axiosClient.put<void>(`/Admin/InstructorProfile/${profileId}/verify-id-card`),
  );
};

export const removeInstructorIntroVideo = async (
  profileId: number,
  reason?: string,
): Promise<void> => {
  await getResponseData(
    axiosClient.delete<void>(`/Admin/InstructorProfile/${profileId}/intro-video`, {
      params: reason ? { reason } : undefined,
    }),
  );
};