import { gatewayClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";

export const updatePlan = async (
  id: number,
  formData: FormData,
): Promise<Plan> => {
  return getResponseData(
    gatewayClient.put<Plan>(`/api/v1/Plans/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  );
};
