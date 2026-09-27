import { axiosClient, getResponseData } from "../../../lib/axios";
import type {
  AdminDismissReportRequest,
  AdminRevokeProfileReportRequest,
  AdminWarnReportRequest,
  GetTeacherReportsParams,
  GetTeacherReportsResponse,
  TeacherReportDetail,
} from "../types";

export const getTeacherReports = async (
  params: GetTeacherReportsParams = {}
): Promise<GetTeacherReportsResponse> => {
  const { page = 1, pageSize = 10, status = "All", category = "All" } = params;
  return getResponseData(
    axiosClient.get<GetTeacherReportsResponse>("/admin/TeacherReport", {
      params: {
        page,
        pageSize,
        ...(status && status !== "All" ? { status } : {}),
        ...(category && category !== "All" ? { category } : {}),
      },
    })
  );
};

export const getTeacherReportDetail = async (
  id: number
): Promise<TeacherReportDetail> => {
  return getResponseData(
    axiosClient.get<TeacherReportDetail>(`/admin/TeacherReport/${id}`)
  );
};

export const warnTeacherReport = async (
  id: number,
  data: AdminWarnReportRequest
): Promise<TeacherReportDetail> => {
  return getResponseData(
    axiosClient.put<TeacherReportDetail>(`/admin/TeacherReport/${id}/warn`, data)
  );
};

export const revokeTeacherProfile = async (
  id: number,
  data: AdminRevokeProfileReportRequest
): Promise<TeacherReportDetail> => {
  return getResponseData(
    axiosClient.put<TeacherReportDetail>(
      `/admin/TeacherReport/${id}/revoke-profile`,
      data
    )
  );
};

export const dismissTeacherReport = async (
  id: number,
  data: AdminDismissReportRequest
): Promise<TeacherReportDetail> => {
  return getResponseData(
    axiosClient.put<TeacherReportDetail>(
      `/admin/TeacherReport/${id}/dismiss`,
      data
    )
  );
};
