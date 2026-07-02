import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ChallengeDto } from "../types";

/**
 * Fetch all challenges in the system (including 'not started' ones for administration).
 */
export const getChallenges = async (): Promise<ChallengeDto[]> => {
  return getResponseData(
    axiosClient.get<ChallengeDto[]>("/api/admin/challenges")
  );
};
