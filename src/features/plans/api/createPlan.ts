import { axiosClient, getResponseData } from "../../../lib/axios";
import type { Plan } from "../../../entities/types";

export const createPlan = async (formData: FormData): Promise<Plan> => {
  return getResponseData(
    axiosClient.post<Plan>("/v1/Plans", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  );
};
