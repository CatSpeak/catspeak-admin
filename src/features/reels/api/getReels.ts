import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ReelDto } from "../types";

/**
 * Fetch all reels in the system (administrator view).
 */
export const getReels = async (): Promise<ReelDto[]> => {
  return getResponseData(
    axiosClient.get<ReelDto[]>("/api/admin/reels")
  );
};
