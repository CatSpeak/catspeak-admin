import { axiosClient, getResponseData } from "../../../lib/axios";
import type { UserDetail } from "../types";

export const getUserDetail = async (userId: number): Promise<UserDetail> => {
  return getResponseData(axiosClient.get<UserDetail>(`/Admin/users/${userId}`));
};
