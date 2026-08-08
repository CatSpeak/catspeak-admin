export type ClassStatus =
  | "UPCOMING"
  | "OPEN_FOR_ENROLLMENT"
  | "NOT_STARTED"
  | "TEACHING"
  | "ARCHIVED"
  | "FINISHED";

export interface AdminClass {
  id: number;
  name: string;
  courseId: number | null;
  courseName: string | null;
  teacherName: string | null;
  language: string;
  levels: string[];
  status: ClassStatus;
  adminStatus: ClassStatus | null;
  capacity: number;
  enrolledCount: number;
  price: number;
  description: string | null;
  enrollmentStartTick: number;
  enrollmentEndTick: number;
  startDateTick: number;
  updatedAtTick: number;
}

export interface AdminCourse {
  id: number;
  name: string;
  language: string;
  status: string | null;
  classCount: number;
}

export interface AdminScheduleEntry {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface AdminClassSession {
  sessionNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  isModified: boolean;
}

export interface AdminEnrolledStudent {
  accountId: number;
  name: string;
  email: string;
  status: number;
  enrolledAtTick: number;
}

export interface AdminClassDetail {
  item: AdminClass;
  schedule: AdminScheduleEntry[];
  sessions: AdminClassSession[];
  students: AdminEnrolledStudent[];
}

export interface PaginationAdditionalData {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PagedResponse<T> {
  total_records: number;
  page: number;
  pageSize: number;
  data: T[];
  additionalData: PaginationAdditionalData;
}

export interface ClassFilters {
  search: string;
  language: string;
  status: string;
}

export interface ClassStats {
  total: number;
  openForEnrollment: number;
  notStarted: number;
  teaching: number;
  finished: number;
}
