import { axiosClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";

export interface PlanResponse {
  data: Plan[];
  page: number;
  pageSize: number;
  total_records: number;
}

export const getPlans = async (): Promise<PlanResponse> => {
  return getResponseData(axiosClient.get<PlanResponse>("/v1/Plans/admin/all"));
};
