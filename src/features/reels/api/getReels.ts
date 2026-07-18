import { axiosClient, getResponseData } from "../../../lib/axios";
import type { ReelDto } from "../types";

interface PaginatedReelsResponse {
  total_records: number;
  page: number;
  pageSize: number;
  data: ReelDto[];
  additionalData?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

/**
 * Fetch all reels in the system (administrator view).
 * The API returns a paginated wrapper; we extract the `data` array.
 */
export const getReels = async (): Promise<ReelDto[]> => {
  const response = await getResponseData(
    axiosClient.get<PaginatedReelsResponse>("/reels/reels"),
  );
  return response.data ?? [];
};
