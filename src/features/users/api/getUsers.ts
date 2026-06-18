import { axiosClient, getResponseData } from "../../../lib/axios";
import type { GetAccountsResponse } from "../types";

export interface AccountFilters {
    search?: string;
    roleId?: number;
    level?: string;
    status?: number;
}

export const getAccounts = async (
    page: number = 1,
    pageSize: number = 50,
    filters: AccountFilters = {},
): Promise<GetAccountsResponse> => {
    const params: Record<string, unknown> = { page, pageSize };

    if (filters.search) {
        const query = filters.search.trim();
        if (query.includes("@")) {
            params.email = query;
        } else if (/^\+?[0-9\s\-()]{4,}$/.test(query)) {
            // Matches phone numbers with digits, spaces, dashes, or parentheses
            params.phoneNumber = query;
        } else {
            params.username = query;
        }
    }

    if (filters.roleId !== undefined) params.roleId = filters.roleId;
    if (filters.level) params.level = filters.level;
    if (filters.status !== undefined) params.status = filters.status;

    return getResponseData(
        axiosClient.get<GetAccountsResponse>("/admin/users", { params }),
    );
};
