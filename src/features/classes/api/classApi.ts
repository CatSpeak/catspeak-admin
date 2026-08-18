import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  AdminClass,
  AdminClassDetail,
  AdminCourse,
  ClassFilters,
  ClassStats,
  PagedResponse,
  StudentCandidate,
} from "../types";

export const getClasses = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: Partial<ClassFilters>,
): Promise<PagedResponse<AdminClass>> => {
  const params: Record<string, unknown> = { Page: page, PageSize: pageSize };

  if (filters?.search) params.Search = filters.search;
  if (filters?.language) params.Language = filters.language;
  if (filters?.status) params.Status = filters.status;

  return getResponseData(
    axiosClient.get<PagedResponse<AdminClass>>("/admin/classes", { params }),
  );
};

export const getCourses = async (
  search?: string,
  page: number = 1,
  pageSize: number = 100,
): Promise<PagedResponse<AdminCourse>> => {
  const params: Record<string, unknown> = { Page: page, PageSize: pageSize };
  if (search) params.Search = search;

  return getResponseData(
    axiosClient.get<PagedResponse<AdminCourse>>("/admin/classes/courses", {
      params,
    }),
  );
};

export const getClassDetail = async (
  classId: number,
): Promise<AdminClassDetail> => {
  return getResponseData(
    axiosClient.get<AdminClassDetail>(`/admin/classes/${classId}`),
  );
};

export const getClassStats = async (): Promise<ClassStats> => {
  return getResponseData(
    axiosClient.get<ClassStats>("/admin/classes/stats"),
  );
};

export const setClassStatus = async (
  classId: number,
  status: string,
): Promise<void> => {
  await axiosClient.put(`/admin/classes/${classId}/status`, { status });
};

export const addStudent = async (
  classId: number,
  accountId: number,
): Promise<void> => {
  await axiosClient.post(`/admin/classes/${classId}/students`, { accountId });
};

export const removeStudent = async (
  classId: number,
  accountId: number,
): Promise<void> => {
  await axiosClient.delete(`/admin/classes/${classId}/students/${accountId}`);
};

export const searchStudents = async (
  search: string,
  limit: number = 20,
): Promise<StudentCandidate[]> => {
  return getResponseData(
    axiosClient.get<StudentCandidate[]>("/admin/classes/students", {
      params: { search, limit },
    }),
  );
};
