export interface Account {
  accountId: number;
  username: string;
  email: string;
  avatarImageUrl: string | null;
  level: string | null;
  country: string | null;
  createDate: string;
  status: number;
  roleId: number;
  isEmailVerified: boolean;
  isOnline: boolean;
  lastSeen: string | null;
  roleName?: string;
  phoneNumber?: string;
  totalSpent?: number;
  avgSessionDuration?: number;
  createdById: number | null;
  createdByUsername: string | null;
  responsibleLanguageCommunities: string[];
  visitDurationForStaff?: number;
}
