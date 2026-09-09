import { gatewayClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";

export const updatePlanStatus = async (
  id: number,
  packageStatus: string,
): Promise<Plan> => {
  return getResponseData(
    gatewayClient.put<Plan>(`/api/v1/Plans/${id}/status`, {
      packageStatus,
    }),
  );
};
