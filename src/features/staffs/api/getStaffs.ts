import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetStaffsResponse } from "../types";

export const getStaffs = async (
    page: number = 1,
    pageSize: number = 50,
): Promise<GetStaffsResponse> => {
    return getResponseData(
        axiosClient.get<GetStaffsResponse>("/admin/users?roleId=3", {
            params: {
                page,
                pageSize,
            },
        }),
    );
};
