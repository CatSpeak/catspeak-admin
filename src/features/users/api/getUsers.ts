import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetAccountsResponse } from "../types";

export type UserSortBy = "Username" | "CreateDate";
export type SortOrder = "Asc" | "Desc";

export interface GetUsersParams {
  SearchKeyword?: string;
  Username?: string;
  Email?: string;
  PhoneNumber?: string;
  RoleIds?: number[];
  Countries?: string[];
  PreferredLanguages?: string[];
  Levels?: string[];
  FromDate?: string;
  ToDate?: string;
  AmountSpentMinVnd?: number;
  AmountSpentMaxVnd?: number;
  VisitDurationPeriod?: string;
  SortBy?: UserSortBy;
  Page?: number;
  PageSize?: number;
  SortOrder?: SortOrder;
}

export interface AccountFilters {
  search?: string;
  roleId?: number;
  level?: string;
  status?: number;
}

/**
 * Fetch paginated list of accounts/users for Admin.
 * Accepts legacy (page, pageSize, filters) signature or direct GetUsersParams object.
 */
export const getAccounts = async (
  pageOrParams: number | GetUsersParams = 1,
  pageSizeParam: number = 50,
  filters: AccountFilters = {},
): Promise<GetAccountsResponse> => {
  let params: GetUsersParams & Record<string, unknown> = {};

  if (typeof pageOrParams === "number") {
    params.Page = pageOrParams;
    params.PageSize = pageSizeParam;

    if (filters.search) {
      params.SearchKeyword = filters.search.trim();
    }

    if (filters.roleId !== undefined) params.RoleIds = [filters.roleId];
    if (filters.level) params.Levels = [filters.level];
    if (filters.status !== undefined) params.status = filters.status;
  } else {
    params = { ...pageOrParams };
  }

  return getResponseData(
    axiosClient.get<GetAccountsResponse>("/Admin/users", { params }),
  );
};

