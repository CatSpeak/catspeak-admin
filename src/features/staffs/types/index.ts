import type { Account } from "../../../entities/types";

export type { Account };

export interface PaginationData {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface GetStaffsResponse {
    data: Account[];
    additionalData: PaginationData;
}

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

export interface StaffDetail extends Account {
    phoneNumber: string;
    languageLearning: string;
    naturalLanguage: string;
    proficiency: string;
    transactions: Transaction[];
    packages: Package[];
}

export interface GetStaffDetailResponse {
    data: StaffDetail;
}
