import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ReelStatisticsDto } from "../types";

export const getReelStats = async (): Promise<ReelStatisticsDto> => {
  return getResponseData(
    axiosClient.get<ReelStatisticsDto>("/reels/reels/statistics"),
  );
};
