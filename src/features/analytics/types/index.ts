export interface PrevPeriodData {
  changePercent: number;
  changeAbsolute: number;
}

export interface NewUserResponse {
  totalNewUsers: number;
  period: string;
  dailyBreakdown: string[];
  prevPeriod: PrevPeriodData | null;
}

export interface RetentionResponse {
  d1Retention: number;
  d7Retention: number;
  d30Retention: number;
  cohortSize: number;
  prevPeriod: PrevPeriodData | null;
}

export interface ChurnResponse {
  currentChurnRate: number;
  churnedUsers: number;
  activeUsersAtPeriodStart: number;
  prevPeriod: PrevPeriodData | null;
}

export interface ExistingUsersResponse {
  totalExistingUsers: number;
}

export interface UserClassificationResponse {
  newUsers: number;
  existingUsers: number;
  newUserRatio: number;
}

export interface ActivityBreakdownResponse {
  eventTypes: Array<{ type: string; count: number }>;
  dailyTrend: Array<{ date: string; count: number }>;
}

export interface PostResponse {
  totalPosts: number;
  totalViews: number;
  totalComments: number;
  totalReactions: number;
  totalShares: number;
}

export type AnalyticsPeriod = "today" | "last7days" | "last30days" | "thismonth" | "custom";

export interface DateRange {
  period: AnalyticsPeriod;
  fromDate?: string;
  toDate?: string;
}
