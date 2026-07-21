import { axiosClient, getResponseData } from "../../../lib/axios";

export interface LetterReport {
  storyId: number;
  accountId: number;
  username: string;
  avatarImageUrl?: string;
  storyContent: string;
  languageCommunity?: string;
  createDate?: string;
  expiresAt?: string;
  status?: number;
}

export interface LetterReportsResponse {
  data: LetterReport[];
  total_records: number;
}

export type LetterReportSortBy =
  | "Content"
  | "AuthorUsername"
  | "CreateDate"
  | "Status";
export type SortOrder = "Asc" | "Desc";

export interface GetLetterReportsParams {
  Content?: string;
  AuthorUsername?: string;
  Statuses?: number[];
  FromDate?: string;
  ToDate?: string;
  LanguageCommunities?: string[];
  SortBy?: LetterReportSortBy;
  Page?: number;
  PageSize?: number;
  SortOrder?: SortOrder;
}

/**
 * Fetch paginated list of user stories (letter reports) for Admin.
 * Accepts either a GetLetterReportsParams object or legacy (page, pageSize) arguments.
 */
export const getLetterReports = async (
  paramsOrPage: GetLetterReportsParams | number = 1,
  pageSizeParam?: number,
): Promise<LetterReportsResponse> => {
  let params: GetLetterReportsParams;

  if (typeof paramsOrPage === "number") {
    params = {
      Page: paramsOrPage,
      PageSize: pageSizeParam,
    };
  } else {
    params = paramsOrPage;
  }

  return getResponseData(
    axiosClient.get<LetterReportsResponse>("/user-stories", {
      params,
    }),
  );
};

/**
 * Get detailed user story (letter report) for Admin.
 */
export const getLetterReportById = async (
  id: number | string,
): Promise<LetterReport> => {
  return getResponseData(axiosClient.get<LetterReport>(`/user-stories/${id}`));
};

/**
 * Delete a user story (letter report).
 */
export const deleteLetterReport = async (
  id: number | string,
): Promise<void> => {
  return getResponseData(axiosClient.delete<void>(`/user-stories/${id}`));
};
