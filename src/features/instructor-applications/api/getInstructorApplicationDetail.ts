import { axiosClient, getResponseData } from "../../../lib/axios";
import type { InstructorApplicationDetail } from "../types";

export const getInstructorApplicationDetail = async (
  id: number,
): Promise<InstructorApplicationDetail> => {
  return getResponseData(
    axiosClient.get<InstructorApplicationDetail>(
      `/api/Admin/instructor-profiles/${id}`,
    ),
  );
};
