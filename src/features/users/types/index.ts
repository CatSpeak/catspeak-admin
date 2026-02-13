import type { Account } from "../../../entities/account/types";

export type { Account };

export interface PaginationData {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface GetAccountsResponse {
    data: Account[];
    additionalData: PaginationData;
}

// User Detail Types
export interface Transaction {
    id: string;
    time: string;
    type: string;
    amount: number;
}

export interface Package {
    type: string;
    unitPrice: number;
    quantity: number;
    total: number;
}

export interface UserDetail extends Account {
    phoneNumber: string;
    languageLearning: string;
    naturalLanguage: string;
    proficiency: string;
    transactions: Transaction[];
    packages: Package[];
}

export interface GetUserDetailResponse {
    data: UserDetail;
}
