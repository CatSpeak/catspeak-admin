import { axiosClient, getResponseData } from "../../../lib/axios";
import type { InstructorApplicationDetail } from "../types";

export const getInstructorApplicationDetail = async (
  id: number,
): Promise<InstructorApplicationDetail> => {
  return getResponseData(
    axiosClient.get<InstructorApplicationDetail>(
      `/Admin/instructor-profiles/${id}`,
    ),
  );
};
