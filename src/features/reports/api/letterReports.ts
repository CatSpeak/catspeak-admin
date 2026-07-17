import { axiosClient, getResponseData } from "../../../lib/axios";

export interface LetterReport {
  id: number;
  letterId?: string;
  ownerId?: string;
  reportersCount?: number;
  content: string;
  decision?: string;
  authorUsername?: string;
  createDate?: string;
  status?: number;
  languageCommunity?: string;
}

export interface LetterReportsResponse {
  data: LetterReport[];
  total_records: number;
}

/**
 * Fetch paginated list of user stories (letter reports) for Admin.
 * Only uses page and pageSize parameters.
 */
export const getLetterReports = async (
  page: number,
  pageSize: number,
): Promise<LetterReportsResponse> => {
  return getResponseData(
    axiosClient.get<LetterReportsResponse>("/Admin/letter-reports", {
      params: {
        Page: page,
        PageSize: pageSize,
      },
    }),
  );
};

/**
 * Get detailed user story (letter report) for Admin.
 */
export const getLetterReportById = async (
  id: number | string,
): Promise<LetterReport> => {
  return getResponseData(
    axiosClient.get<LetterReport>(`/Admin/letter-reports/${id}`),
  );
};

/**
 * Delete a user story (letter report).
 */
export const deleteLetterReport = async (
  id: number | string,
): Promise<void> => {
  return getResponseData(
    axiosClient.delete<void>(`/Admin/letter-reports/${id}`),
  );
};
