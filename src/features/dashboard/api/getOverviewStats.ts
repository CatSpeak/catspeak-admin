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

export interface UsersByRegionItem {
  id: string;
  value: number;
}

/**
 * Comprehensive mapping dictionary from English country names (lowercase)
 * to ISO 3166-1 alpha-3 codes covering Southeast Asia, East Asia, South Asia,
 * Europe, North America, South America, Australia & Oceania, Middle East, and Africa.
 */
const COUNTRY_NAME_TO_ISO3: Record<string, string> = {
  // Southeast Asia
  "vietnam": "VNM",
  "viet nam": "VNM",
  "thailand": "THA",
  "indonesia": "IDN",
  "singapore": "SGP",
  "malaysia": "MYS",
  "philippines": "PHL",
  "the philippines": "PHL",
  "myanmar": "MMR",
  "burma": "MMR",
  "cambodia": "KHM",
  "laos": "LAO",
  "lao pdr": "LAO",
  "lao people's democratic republic": "LAO",
  "brunei": "BRN",
  "brunei darussalam": "BRN",
  "timor-leste": "TLS",
  "east timor": "TLS",

  // East Asia
  "china": "CHN",
  "people's republic of china": "CHN",
  "prc": "CHN",
  "japan": "JPN",
  "south korea": "KOR",
  "republic of korea": "KOR",
  "korea": "KOR",
  "korea, republic of": "KOR",
  "north korea": "PRK",
  "democratic people's republic of korea": "PRK",
  "taiwan": "TWN",
  "hong kong": "HKG",
  "macau": "MAC",
  "macao": "MAC",
  "mongolia": "MNG",

  // South Asia
  "india": "IND",
  "pakistan": "PAK",
  "bangladesh": "BGD",
  "sri lanka": "LKA",
  "nepal": "NPL",
  "bhutan": "BTN",
  "maldives": "MDV",
  "afghanistan": "AFG",

  // Europe
  "united kingdom": "GBR",
  "uk": "GBR",
  "great britain": "GBR",
  "britain": "GBR",
  "england": "GBR",
  "germany": "DEU",
  "deutschland": "DEU",
  "france": "FRA",
  "italy": "ITA",
  "spain": "ESP",
  "netherlands": "NLD",
  "holland": "NLD",
  "belgium": "BEL",
  "switzerland": "CHE",
  "sweden": "SWE",
  "norway": "NOR",
  "denmark": "DNK",
  "finland": "FIN",
  "poland": "POL",
  "portugal": "PRT",
  "austria": "AUT",
  "greece": "GRC",
  "ireland": "IRL",
  "czech republic": "CZE",
  "czechia": "CZE",
  "romania": "ROU",
  "hungary": "HUN",
  "ukraine": "UKR",
  "russia": "RUS",
  "russian federation": "RUS",
  "turkey": "TUR",
  "türkiye": "TUR",
  "turkiye": "TUR",
  "slovakia": "SVK",
  "bulgaria": "BGR",
  "croatia": "HRV",
  "serbia": "SRB",
  "belarus": "BLR",
  "lithuania": "LTU",
  "latvia": "LVA",
  "estonia": "EST",
  "slovenia": "SVN",
  "iceland": "ISL",
  "luxembourg": "LUX",
  "cyprus": "CYP",
  "malta": "MLT",

  // North America & Central America / Caribbean
  "united states": "USA",
  "united states of america": "USA",
  "usa": "USA",
  "us": "USA",
  "canada": "CAN",
  "mexico": "MEX",
  "guatemala": "GTM",
  "cuba": "CUB",
  "dominican republic": "DOM",
  "haiti": "HTI",
  "honduras": "HND",
  "el salvador": "SLV",
  "nicaragua": "NIC",
  "costa rica": "CRI",
  "panama": "PAN",
  "jamaica": "JAM",
  "puerto rico": "PRI",

  // South America
  "brazil": "BRA",
  "brasil": "BRA",
  "argentina": "ARG",
  "colombia": "COL",
  "peru": "PER",
  "chile": "CHL",
  "venezuela": "VEN",
  "ecuador": "ECU",
  "bolivia": "BOL",
  "paraguay": "PRY",
  "uruguay": "URY",

  // Australia & Oceania
  "australia": "AUS",
  "new zealand": "NZL",
  "papua new guinea": "PNG",
  "fiji": "FJI",

  // Middle East & Central Asia
  "saudi arabia": "SAU",
  "united arab emirates": "ARE",
  "uae": "ARE",
  "israel": "ISR",
  "iran": "IRN",
  "islamic republic of iran": "IRN",
  "iraq": "IRQ",
  "egypt": "EGY",
  "qatar": "QAT",
  "kuwait": "KWT",
  "oman": "OMN",
  "jordan": "JOR",
  "lebanon": "LBN",
  "kazakhstan": "KAZ",
  "uzbekistan": "UZB",

  // Africa
  "nigeria": "NGA",
  "south africa": "ZAF",
  "kenya": "KEN",
  "ethiopia": "ETH",
  "morocco": "MAR",
  "ghana": "GHA",
  "algeria": "DZA",
  "tunisia": "TUN",
};

/**
 * Checks whether a given code string is already a valid 3-letter ISO 3166-1 alpha-3 code.
 */
export const isIsoAlpha3 = (code: string): boolean => {
  return typeof code === "string" && /^[A-Z]{3}$/i.test(code.trim());
};

/**
 * Converts a country name (written in English) to its ISO 3166-1 alpha-3 code.
 * Returns null if the country cannot be mapped.
 */
export const countryNameToIsoAlpha3 = (countryName: string): string | null => {
  if (!countryName || typeof countryName !== "string") return null;
  const trimmed = countryName.trim();

  if (isIsoAlpha3(trimmed)) {
    return trimmed.toUpperCase();
  }

  const normalized = trimmed.toLowerCase();
  return COUNTRY_NAME_TO_ISO3[normalized] ?? null;
};

/**
 * Fetch users by region statistics.
 * API Endpoint: /Analytics/users-by-region
 * Response format: { id: string, value: number }[]
 *
 * Automatically converts country names to ISO 3166-1 alpha-3 codes if needed.
 * Logs an error to the console for any unmappable region/country names.
 */
export const getUsersByRegionStats = async (): Promise<UsersByRegionItem[]> => {
  try {
    const response = await getResponseData(
      axiosClient.get<unknown>("/Analytics/users-by-region"),
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

    const mappedItems: UsersByRegionItem[] = [];

    for (const item of items) {
      if (typeof item !== "object" || item === null) continue;
      const record = item as Record<string, unknown>;
      const rawId = String(
        record.id ?? record.country ?? record.name ?? record.region ?? "",
      ).trim();
      const value = Number(record.value ?? 0);

      if (!rawId) continue;

      let isoId: string | null = null;
      if (isIsoAlpha3(rawId)) {
        isoId = rawId.toUpperCase();
      } else {
        isoId = countryNameToIsoAlpha3(rawId);
      }

      if (!isoId) {
        console.error(
          `Unable to convert country/region name "${rawId}" to ISO 3166-1 alpha-3 code. This region will be ignored.`,
          record,
        );
        continue;
      }

      mappedItems.push({ id: isoId, value });
    }

    return mappedItems;
  } catch (error) {
    console.error("Error fetching users by region stats:", error);
    throw error;
  }
};


