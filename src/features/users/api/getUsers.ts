import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetAccountsResponse } from "../types";

export const getAccounts = async (
    page: number = 1,
    pageSize: number = 50,
): Promise<GetAccountsResponse> => {
    return getResponseData(
        axiosClient.get<GetAccountsResponse>("/admin/users", {
            params: {
                page,
                pageSize,
            },
        }),
    );
};
