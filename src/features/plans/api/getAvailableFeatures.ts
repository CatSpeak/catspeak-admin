import { gatewayClient, getResponseData } from "../../../lib/axios";
import type { SubscriptionFeature } from "../../../entities/types";

export const getAvailableFeatures = async (): Promise<
  SubscriptionFeature[]
> => {
  return getResponseData(
    gatewayClient.get<SubscriptionFeature[]>(
      "/api/v1/Plans/admin/available-features",
    ),
  );
};
