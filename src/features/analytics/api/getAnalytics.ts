import { axiosClient } from "../../../lib/axios";
import type {
  NewUserResponse,
  RetentionResponse,
  ChurnResponse,
  UserClassificationResponse,
  ExistingUsersResponse,
  ActivityBreakdownResponse,
  PostResponse,
  DateRange,
} from "../types";

const fetchWithDefaultParams = async <T>(
  endpoint: string,
  dateRange: DateRange
): Promise<T> => {
  const params: Record<string, string> = { period: dateRange.period };
  if (dateRange.fromDate) params.fromDate = dateRange.fromDate;
  if (dateRange.toDate) params.toDate = dateRange.toDate;

  const response = await axiosClient.get<T>(`/analytics/${endpoint}`, { params });
  return response.data;
};

export const getNewUsers = async (dateRange: DateRange): Promise<NewUserResponse> => {
  return fetchWithDefaultParams<NewUserResponse>("new-users", dateRange);
};

export const getRetention = async (dateRange: DateRange): Promise<RetentionResponse> => {
  return fetchWithDefaultParams<RetentionResponse>("retention", dateRange);
};

export const getChurn = async (dateRange: DateRange): Promise<ChurnResponse> => {
  return fetchWithDefaultParams<ChurnResponse>("churn", dateRange);
};

export const getExistingUsers = async (dateRange: DateRange): Promise<ExistingUsersResponse> => {
  return fetchWithDefaultParams<ExistingUsersResponse>("existing-users", dateRange);
};

export const getUserClassification = async (
  dateRange: DateRange
): Promise<UserClassificationResponse> => {
  return fetchWithDefaultParams<UserClassificationResponse>("user-classification", dateRange);
};

export const getActivityBreakdown = async (
  dateRange: DateRange
): Promise<ActivityBreakdownResponse> => {
  return fetchWithDefaultParams<ActivityBreakdownResponse>("activity-breakdown", dateRange);
};

export const getPost = async (dateRange: DateRange): Promise<PostResponse> => {
  return fetchWithDefaultParams<PostResponse>("posts", dateRange)
}