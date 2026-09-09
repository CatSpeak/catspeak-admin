import { gatewayClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";

interface ApiResponseEnvelope<T> {
  data?: T;
  success?: boolean;
  [key: string]: unknown;
}

export const getPlanById = async (id: number): Promise<Plan> => {
  const response = await getResponseData(
    gatewayClient.get<Plan | ApiResponseEnvelope<Plan>>(`/api/v1/Plans/${id}`),
  );

  if (response && typeof response === "object" && "data" in response) {
    const envelope = response as ApiResponseEnvelope<Plan>;
    if (!Array.isArray(response) && envelope.data !== undefined) {
      return envelope.data;
    }
  }
  return response as Plan;
};
