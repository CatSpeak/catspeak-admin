import { gatewayClient, getResponseData } from "../../../lib/axios";
import type { PlanStatisticsDto } from "../../../entities/types";

export const getPlanStats = async (): Promise<PlanStatisticsDto> => {
  return getResponseData(
    gatewayClient.get<PlanStatisticsDto>("/api/v1/Plans/admin/statistics"),
  );
};
