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
  label: string;
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
        const label = String(item.label ?? item.date ?? "");
        const activeUsers = Number(item.activeUsers ?? item.value ?? 0);
        const accountUsers = Number(
          item.accountUsers ??
            item.totalUsers ??
            item.registeredUsers ??
            item.value ??
            activeUsers,
        );
        const value = Number(item.value ?? activeUsers);
        const annotation = String(item.annotation ?? "");

        let values: [number, number] = [accountUsers, activeUsers];
        if (Array.isArray(item.values) && item.values.length >= 2) {
          values = [Number(item.values[0]), Number(item.values[1])];
        }

        return {
          label,
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
