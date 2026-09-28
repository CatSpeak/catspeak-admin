import { axiosClient, getResponseData } from "../../../lib/axios";
import type { LanguageRequestDetail } from "../types";

export const getLanguageRequestDetail = async (
  id: number,
): Promise<LanguageRequestDetail> => {
  return getResponseData(
    axiosClient.get<LanguageRequestDetail>(`/Admin/language-requests/${id}`),
  );
};
