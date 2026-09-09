import { gatewayClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";
import { unwrapData } from "./envelope";

export const getPlanById = async (id: number): Promise<Plan> => {
  const response = await getResponseData(
    gatewayClient.get<Plan | Record<string, unknown>>(`/api/v1/Plans/${id}`),
  );

  return unwrapData<Plan>(response, null as unknown as Plan);
};
