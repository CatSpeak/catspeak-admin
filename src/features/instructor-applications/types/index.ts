export type ApplicationStatus = "Pending" | "Approved" | "Rejected" | "RequestEdit";

/** Staging revision status — superset of the profile scale with Cancelled. */
export type RevisionStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled"
  | "RequestEdit";

/** 0=Update (post-approval teaching edit), 1=Initial (first application). */
export type RevisionRequestType = 0 | 1;

export type BanDuration = "ThirtyDays" | "SixMonths" | "OneYear" | "TwoYears";

/** Existing profile endpoint kept for the review-history view on the teacher row. */
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

export interface InstructorRevisionListItem {
  revisionId: number;
  accountId: number;
  username: string;
  accountEmail: string;
  phoneNumber: string;
  fullName: string;
  requestType: RevisionRequestType;
  status: RevisionStatus;
  statusCode: number;
  createdAt: string;
}

export interface GetInstructorRevisionsResponse {
  items: InstructorRevisionListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
  /** True when this profile now belongs to a dedicated teacher account (approved and re-pointed). */
  isTeacherAccount?: boolean;
  /** The teacher account ID the approved profile belongs to. */
  teacherAccountId?: number | null;
  /** The original user account the application was submitted from. */
  sourceAccountId?: number | null;
  sourceUsername?: string | null;
  sourceAccountEmail?: string | null;
}

/** Detail payload for a staging revision (initial/update). */
export interface InstructorRevisionDetail {
  accountId: number;
  username: string;
  accountEmail: string;
  reviewedByAdminUsername: string | null;
  profileId: number;
  status: RevisionStatus;
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
  isRevision: boolean;
  revisionId: number;
  requestType: RevisionRequestType;
  /** True when this profile now belongs to a dedicated teacher account (approved and re-pointed). */
  isTeacherAccount?: boolean;
  teacherAccountId?: number | null;
  sourceAccountId?: number | null;
  sourceUsername?: string | null;
  sourceAccountEmail?: string | null;
  /** Live Approved profile snapshot — present for Update revisions only. */
  liveSnapshot?: InstructorApplicationDetail | null;
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