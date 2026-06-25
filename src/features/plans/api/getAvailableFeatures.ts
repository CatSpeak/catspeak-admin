import { axiosClient, getResponseData } from "../../../lib/axios";
import type { SubscriptionFeature } from "../../../entities/types";

export const getAvailableFeatures = async (): Promise<SubscriptionFeature[]> => {
  return getResponseData(axiosClient.get<SubscriptionFeature[]>("/v1/Plans/admin/available-features"));
};
