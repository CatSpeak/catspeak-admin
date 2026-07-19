import { axiosClient, getResponseData } from "../../../lib/axios";
import type { PlanStatisticsDto } from "../../../entities/types";

export const getPlanStats = async (): Promise<PlanStatisticsDto> => {
  return getResponseData(
    axiosClient.get<PlanStatisticsDto>("/v1/Plans/admin/statistics"),
  );
};
