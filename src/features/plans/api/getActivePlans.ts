import { gatewayClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";

interface ApiResponseEnvelope<T> {
  data?: T;
  success?: boolean;
  [key: string]: unknown;
}

export const getActivePlans = async (): Promise<Plan[]> => {
  const response = await getResponseData(
    gatewayClient.get<Plan[] | ApiResponseEnvelope<Plan[]>>("/api/v1/Plans"),
  );

  if (Array.isArray(response)) {
    return response;
  }
  return response?.data ?? [];
};
