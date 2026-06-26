import { axiosClient, getResponseData } from "../../../lib/axios";

export const deletePlanFeature = async (planId: number, featureId: number): Promise<boolean> => {
  try {
    await getResponseData(axiosClient.delete(`/v1/Plans/${planId}/features/${featureId}`));
    return true;
  } catch (error) {
    console.error("Failed to delete plan feature:", error);
    return false;
  }
};
