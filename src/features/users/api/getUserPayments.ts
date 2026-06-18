import { axiosClient, getResponseData } from "../../../lib/axios";

export interface UserPayment {
  paymentId: number;
  userId: number;
  username: string;
  email: string;
  amount: number;
  method: string;
  createDate: string;
  status: number; // 1: Success, 2: Cancelled, etc.
  orderCode: number;
  adminNote: string | null;
}

/**
 * Fetch transaction history for a specific user.
 * Supports defensive checks to handle variations in backend return formats.
 */
export const getUserPayments = async (userId: number): Promise<UserPayment[]> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/v1/Payments/admin/list", {
        params: { userId },
      })
    );

    // Defensive parsing for backend structures
    if (Array.isArray(response)) {
      return response as UserPayment[];
    }
    if (response && typeof response === "object") {
      const responseData = response as Record<string, unknown>;
      if ("data" in responseData && Array.isArray(responseData.data)) {
        return responseData.data as UserPayment[];
      }
      if ("items" in responseData && Array.isArray(responseData.items)) {
        return responseData.items as UserPayment[];
      }
    }
    return [];
  } catch (error) {
    console.error(`Error fetching payments for user ID ${userId}:`, error);
    throw error;
  }
};
