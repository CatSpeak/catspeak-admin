import { axiosClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";

export const updatePlanStatus = async (id: number, packageStatus: string): Promise<Plan> => {
  return getResponseData(
    axiosClient.put<Plan>(`/v1/Plans/${id}/status`, {
      packageStatus,
    })
  );
};
