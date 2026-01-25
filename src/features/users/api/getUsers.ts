import { axiosClient } from '../../../lib/axios';
import type { Account } from '../types';

interface GetAccountsResponse {
    success: boolean;
    message: string;
    data: Account[];
}

export const getAccounts = async (): Promise<Account[]> => {
    const response = await axiosClient.get<GetAccountsResponse>('/Account');
    // axios interceptor might return response.data directly, but let's be safe and assume the structure
    // The user showed "data": [...] nested inside the response.
    // My interceptor `return response.data` means `response` here IS the JSON body.
    // So response should be { success: true, message: "Success", data: [...] }
    return (response as unknown as GetAccountsResponse).data;
};
