export type ApplicationStatus = "Pending" | "Approved" | "Rejected" | "RequestEdit";

export type BanDuration = "ThirtyDays" | "SixMonths" | "OneYear" | "TwoYears";

export interface InstructorApplication {
  profileId: number;
  accountId: number;
  username: string;
  accountEmail: string;
  phoneNumber: string;
  fullName: string;
  status: ApplicationStatus;
  statusCode: number;
  submittedAt: string;
}

export interface InstructorApplicationDetail {
  accountId: number;
  username: string;
  accountEmail: string;
  reviewedByAdminUsername: string | null;
  profileId: number;
  status: ApplicationStatus;
  statusCode: number;
  fullName: string;
  email: string;
  address: string | null;
  phoneNumber: string;
  nationality: string | null;
  languagesTeach: string; // JSON string array e.g. '["English","Vietnamese"]'
  nativeLanguage: string | null;
  idCardFrontUrl: string | null;
  idCardBackUrl: string | null;
  introduction: string | null;
  credentialUrls: string; // JSON string array of URLs
  introVideoUrl: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  editRequestNote: string | null;
  banUntil: string | null;
  isBanned: boolean;
  canReapply: boolean;
}

export interface GetInstructorApplicationsResponse {
  items: InstructorApplication[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RejectApplicationRequest {
  reason: string;
  banDuration: BanDuration;
}

export interface RequestEditApplicationRequest {
  editNote: string;
}
