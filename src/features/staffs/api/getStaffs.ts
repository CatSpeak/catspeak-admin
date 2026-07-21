import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetStaffsResponse } from "../types";
import type { GetUsersParams } from "../../users/api/getUsers";

export interface GetStaffsParams extends Omit<GetUsersParams, "RoleIds"> {
  RoleIds?: number[];
}

/**
 * Fetch a paged list of staff members (roleId = 3).
 * Accepts either a GetStaffsParams object or legacy (page, pageSize) arguments.
 */
export const getStaffs = async (
  pageOrParams: number | GetStaffsParams = 1,
  pageSizeParam: number = 50,
): Promise<GetStaffsResponse> => {
  let params: GetUsersParams;

  if (typeof pageOrParams === "number") {
    params = {
      Page: pageOrParams,
      PageSize: pageSizeParam,
      RoleIds: [3],
    };
  } else {
    params = {
      Page: 1,
      PageSize: 50,
      RoleIds: [3],
      ...pageOrParams,
    };
  }

  return getResponseData(
    axiosClient.get<GetStaffsResponse>("/Admin/users", {
      params,
    }),
  );
};

