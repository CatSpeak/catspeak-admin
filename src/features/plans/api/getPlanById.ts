import { axiosClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";

export const getPlanById = async (id: number): Promise<Plan> => {
  return getResponseData(axiosClient.get<Plan>(`/v1/Plans/${id}`));
};
