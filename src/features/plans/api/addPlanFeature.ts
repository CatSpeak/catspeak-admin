import { gatewayClient, getResponseData } from "../../../lib/axios";

export const addPlanFeature = async (
  planId: number,
  featureData: any,
): Promise<boolean> => {
  try {
    await getResponseData(
      gatewayClient.post(`/api/v1/Plans/${planId}/features`, featureData),
    );
    return true;
  } catch (error) {
    console.error("Failed to add plan feature:", error);
    return false;
  }
};
