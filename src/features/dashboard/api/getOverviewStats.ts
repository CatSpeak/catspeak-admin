import { axiosClient, getResponseData } from "../../../lib/axios";

export const mockupColors = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#6366F1", // Indigo
];

export interface ActiveUsersParams {
  period?:
    | "All"
    | "Today"
    | "Last7Days"
    | "Last30Days"
    | "ThisMonth"
    | "ThisYear";
  interval?: "Daily" | "Weekly" | "Monthly" | "Yearly";
  fromDate?: string;
  toDate?: string;
}

export interface TrafficSegment {
  label: string;
  value: number;
  color: string;
}

export interface AgeGenderSegment {
  label: string;
  value: number;
  color: string;
  male: number;
  female: number;
}

export interface ActiveUsersItem {
  periodStart?: string;
  periodEnd?: string;
  label: string;
  newAccounts: number;
  accountUsers: number;
  activeUsers: number;
  value: number;
  values: [number, number];
  annotation: string;
}

/**
 * Fetch traffic channel statistics.
 * Uses defensive parsing to handle various backend response structures.
 */
export const getTrafficChannelStats = async (): Promise<TrafficSegment[]> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/Analytics/traffic-channel"),
    );

    let items: unknown[] = [];
    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === "object") {
      const data = response as Record<string, unknown>;
      const target =
        "data" in data && Array.isArray(data.data)
          ? data.data
          : "items" in data && Array.isArray(data.items)
            ? data.items
            : [];
      items = target;
    }

    return items
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      )
      .map((item, index) => {
        const label = String(
          item.label ?? item.channel ?? item.name ?? `Channel ${index + 1}`,
        );
        const value = Number(item.value ?? 0);
        const color = String(
          item.color ?? mockupColors[index % mockupColors.length],
        );
        return { label, value, color };
      });
  } catch (error) {
    console.error("Error fetching traffic channel stats:", error);
    throw error;
  }
};

/**
 * Fetch age and gender statistics.
 * Uses defensive parsing to handle various backend response structures.
 */
export const getAgeGenderStats = async (): Promise<AgeGenderSegment[]> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/Analytics/age-gender"),
    );

    let items: unknown[] = [];
    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === "object") {
      const data = response as Record<string, unknown>;
      const target =
        "data" in data && Array.isArray(data.data)
          ? data.data
          : "items" in data && Array.isArray(data.items)
            ? data.items
            : [];
      items = target;
    }

    return items
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      )
      .map((item, index) => {
        const label = String(
          item.label ?? item.ageGroup ?? item.group ?? `Group ${index + 1}`,
        );
        const value = Number(item.value ?? 0);
        const color = String(
          item.color ?? mockupColors[index % mockupColors.length],
        );
        const male = Number(item.male ?? 0);
        const female = Number(item.female ?? 0);
        return { label, value, color, male, female };
      });
  } catch (error) {
    console.error("Error fetching age gender stats:", error);
    throw error;
  }
};

/**
 * Fetch active users trend data.
 * Uses defensive parsing to handle various backend response structures.
 */
export const getActiveUsersStats = async (
  params?: ActiveUsersParams,
): Promise<ActiveUsersItem[]> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/Analytics/active-users", { params }),
    );

    let items: unknown[] = [];
    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === "object") {
      const data = response as Record<string, unknown>;
      const target =
        "data" in data && Array.isArray(data.data)
          ? data.data
          : "items" in data && Array.isArray(data.items)
            ? data.items
            : [];
      items = target;
    }

    return items
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      )
      .map((item) => {
        const periodStart = String(item.periodStart ?? "");
        const periodEnd = String(item.periodEnd ?? "");
        const newAccounts = Number(
          item.newAccounts ?? item.accountUsers ?? item.newUsers ?? 0,
        );
        const activeUsers = Number(item.activeUsers ?? item.value ?? 0);

        let label = String(item.label ?? item.date ?? "");
        if (!label && periodStart) {
          const d = new Date(periodStart);
          if (!isNaN(d.getTime())) {
            label = d.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          } else {
            label = periodStart;
          }
        }

        const accountUsers = newAccounts;
        const value = Number(item.value ?? activeUsers);
        const annotation = String(item.annotation ?? "");

        let values: [number, number] = [newAccounts, activeUsers];
        if (Array.isArray(item.values) && item.values.length >= 2) {
          values = [Number(item.values[0]), Number(item.values[1])];
        }

        return {
          periodStart,
          periodEnd,
          label,
          newAccounts,
          accountUsers,
          activeUsers,
          value,
          values,
          annotation,
        };
      });
  } catch (error) {
    console.error("Error fetching active users stats:", error);
    throw error;
  }
};

export interface ActiveUserLineData {
  label: string;
  value: number;
}

/**
 * Fetch active users statistics and transform data into line chart format:
 * [{ label: "01 Jun", value: 210 }, ...]
 */
export const getActiveUsersLineData = async (
  params?: ActiveUsersParams,
  lang?: string,
): Promise<ActiveUserLineData[]> => {
  try {
    const defaultParams: ActiveUsersParams = {
      period: "ThisMonth",
      interval: "Monthly",
      ...params,
    };
    const response = await getResponseData(
      axiosClient.get<unknown>("/Analytics/active-users", { params: defaultParams }),
    );

    let items: unknown[] = [];
    if (Array.isArray(response)) {
      items = response;
    } else if (response && typeof response === "object") {
      const data = response as Record<string, unknown>;
      const target =
        "data" in data && Array.isArray(data.data)
          ? data.data
          : "items" in data && Array.isArray(data.items)
            ? data.items
            : [];
      items = target;
    }

    const localeMap: Record<string, string> = {
      vi: "vi-VN",
      zh: "zh-CN",
      en: "en-GB",
    };
    const locale = localeMap[lang || "en"] || "en-GB";

    return items
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      )
      .map((item) => {
        const value = Number(item.activeUsers ?? item.value ?? item.newAccounts ?? 0);
        let label = String(item.label ?? item.date ?? "");

        const periodStart = String(item.periodStart ?? "");
        if (periodStart) {
          const d = new Date(periodStart);
          if (!isNaN(d.getTime())) {
            const day = String(d.getUTCDate()).padStart(2, "0");
            const month = d.toLocaleDateString(locale, { month: "short", timeZone: "UTC" });
            label = `${day} ${month}`;
          }
        }

        return { label, value };
      });
  } catch (error) {
    console.error("Error fetching active users line data:", error);
    throw error;
  }
};

export interface MonthlyTargetProgress {
  percentage: number;
}

/**
 * Fetch monthly target progress (percentage profit increase this month vs same period last month).
 * Uses defensive parsing to handle various backend response structures.
 */
export const getMonthlyTargetProgress = async (): Promise<MonthlyTargetProgress> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/v1/Payments/admin/monthly-target-progress"),
    );

    if (response && typeof response === "object") {
      const data = response as Record<string, unknown>;
      const target =
        "data" in data && data.data && typeof data.data === "object"
          ? (data.data as Record<string, unknown>)
          : data;

      if (
        "percentage" in target &&
        target.percentage !== null &&
        target.percentage !== undefined
      ) {
        return { percentage: Number(target.percentage) };
      }
    }

    if (typeof response === "number") {
      return { percentage: response };
    }

    throw new Error("Invalid response format for monthly target progress");
  } catch (error) {
    console.error("Error fetching monthly target progress:", error);
    throw error;
  }
};

