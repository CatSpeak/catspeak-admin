import { gatewayClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";
import { unwrapData } from "./envelope";

export const getActivePlans = async (): Promise<Plan[]> => {
  const response = await getResponseData(
    gatewayClient.get<Plan[] | Record<string, unknown>>("/api/v1/Plans"),
  );

  return unwrapData<Plan[]>(response, []);
};
