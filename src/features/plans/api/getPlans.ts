import { axiosClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";

export const getPlans = async (): Promise<Plan[]> => {
  return getResponseData(axiosClient.get<Plan[]>("/v1/Plans/admin/all"));
};
