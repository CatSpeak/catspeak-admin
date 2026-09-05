import { axiosClient, getResponseData } from "../../../lib/axios";
import type { InstructorRevisionDetail } from "../types";

export const getInstructorRevisionDetail = async (
  id: number,
): Promise<InstructorRevisionDetail> => {
  return getResponseData(
    axiosClient.get<InstructorRevisionDetail>(
      `/Admin/instructor-revisions/${id}`,
    ),
  );
};