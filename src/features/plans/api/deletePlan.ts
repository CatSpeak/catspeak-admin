import { gatewayClient, getResponseData } from "../../../lib/axios";

export const deletePlan = async (id: number): Promise<void> => {
  return getResponseData(gatewayClient.delete(`/api/v1/Plans/${id}`));
};
