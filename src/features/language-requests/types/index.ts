/** 0=Pending, 1=Approved, 2=Rejected, 3=Cancelled. */
export type LanguageRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

/** 0=Add (new teaching language), 1=Update (change level/credential of an existing one). */
export type LanguageRequestType = 0 | 1;

export interface LanguageRequestListItem {
  requestId: number;
  profileId: number;
  accountId: number;
  username: string;
  accountEmail: string;
  fullName: string;
  language: string;
  level: string;
  requestType: LanguageRequestType;
  status: LanguageRequestStatus;
  statusCode: number;
  createdAt: string;
}

export interface GetLanguageRequestsResponse {
  items: LanguageRequestListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LanguageRequestDetail {
  requestId: number;
  profileId: number;
  accountId: number;
  username: string;
  accountEmail: string;
  fullName: string;
  phoneNumber: string | null;
  language: string;
  /** Requested level. */
  level: string;
  /** New credential file the teacher submitted with the request. */
  credentialUrl: string | null;
  /** Level the live profile had when the request was submitted. */
  previousLevel: string | null;
  /** Credential the live profile had when the request was submitted. */
  previousCredentialUrl: string | null;
  requestType: LanguageRequestType;
  status: LanguageRequestStatus;
  statusCode: number;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByAdminId: number | null;
  reviewedByAdminUsername: string | null;
  /** Rejection reason or admin note. */
  reviewNote: string | null;
}
