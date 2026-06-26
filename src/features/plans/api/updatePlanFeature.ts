import { axiosClient, getResponseData } from "../../../lib/axios";

export const updatePlanFeature = async (planId: number, featureId: number, featureData: any): Promise<boolean> => {
  try {
    await getResponseData(axiosClient.put(`/v1/Plans/${planId}/features/${featureId}`, featureData));
    return true;
  } catch (error) {
    console.error("Failed to update plan feature:", error);
    return false;
  }
};
