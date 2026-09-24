export type TeacherReportCategory =
  | "InappropriateVideo"
  | "MisleadingProfile"
  | "OffensiveBehavior"
  | "Other";

export type TeacherReportStatus =
  | "Pending"
  | "Warned"
  | "Resolved"
  | "Dismissed";

export interface TeacherReportListItem {
  reportId: number;
  reporterId: number;
  reporterUsername?: string;
  reporterFullName?: string;
  reporterEmail?: string;
  reporterAvatarUrl?: string;

  teacherAccountId: number;
  teacherUsername?: string;
  teacherFullName?: string;
  teacherEmail?: string;
  teacherAvatarUrl?: string;

  category: TeacherReportCategory | string;
  description: string;
  status: TeacherReportStatus | string;
  adminNote?: string;

  createdAt: string;
  warnedAt?: string;
  resolvedAt?: string;
  resolvedByAdminId?: number;
  resolvedByAdminUsername?: string;
}

export interface TeacherReportDetail extends TeacherReportListItem {
  profileId?: number;
  introVideoUrl?: string;
  profileStatus?: string;
  profileIntroduction?: string;
  languagesTeach?: string;
  nativeLanguage?: string;
  credentialUrls?: string;
  banUntil?: string;
}

export interface GetTeacherReportsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
}

export interface GetTeacherReportsResponse {
  items: TeacherReportListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminWarnReportRequest {
  warningNote: string;
  removeVideoImmediately: boolean;
}

export interface AdminRevokeProfileReportRequest {
  reason: string;
  lockUserAccount: boolean;
}

export interface AdminDismissReportRequest {
  reason: string;
}
