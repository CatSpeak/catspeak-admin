import { axiosClient, getResponseData } from "../../../lib/axios";

export const deletePlan = async (id: number): Promise<void> => {
  return getResponseData(axiosClient.delete(`/v1/Plans/${id}`));
};
