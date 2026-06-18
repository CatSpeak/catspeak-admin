import { axiosClient, getResponseData } from "../../../lib/axios";

export interface DailyRevenueItem {
  date: string;
  revenueVnd: number;
  transactionCount: number;
}

export interface DashboardStats {
  totalRevenueVnd: number;
  totalTransactions: number;
  successfulTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  cancelledTransactions: number;
  totalReports: number;
  pendingReports: number;
  acceptedReports: number;
  deniedReports: number;
  dailyRevenue: DailyRevenueItem[];
}

/**
 * Fetch payments & reports dashboard summary stats from the backend.
 * Uses defensive parsing to handle various backend response structures.
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/v1/Payments/admin/dashboard")
    );

    if (response && typeof response === "object") {
      const data = response as Record<string, unknown>;

      // Ensure that we extract fields correctly even if wrapped in a nested 'data' or similar envelope
      const target = ("data" in data && data.data && typeof data.data === "object")
        ? (data.data as Record<string, unknown>)
        : data;

      return {
        totalRevenueVnd: Number(target.totalRevenueVnd ?? 0),
        totalTransactions: Number(target.totalTransactions ?? 0),
        successfulTransactions: Number(target.successfulTransactions ?? 0),
        pendingTransactions: Number(target.pendingTransactions ?? 0),
        failedTransactions: Number(target.failedTransactions ?? 0),
        cancelledTransactions: Number(target.cancelledTransactions ?? 0),
        totalReports: Number(target.totalReports ?? 0),
        pendingReports: Number(target.pendingReports ?? 0),
        acceptedReports: Number(target.acceptedReports ?? 0),
        deniedReports: Number(target.deniedReports ?? 0),
        dailyRevenue: Array.isArray(target.dailyRevenue)
          ? target.dailyRevenue
              .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
              .map((item) => ({
                date: String(item.date ?? ""),
                revenueVnd: Number(item.revenueVnd ?? 0),
                transactionCount: Number(item.transactionCount ?? 0),
              }))
          : [],
      };
    }

    throw new Error("Invalid response format received from dashboard stats API");
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
