export interface Account {
  accountId: number;
  amountSpentVnd: number;
  avatarImageUrl: string | null;
  country: string | null;
  createDate: string;
  createdById: number | null;
  createdByUsername: string | null;
  currentSubscriptionId: number | null;
  currentSubscriptionName: string | null;
  department: string | null;
  email: string;
  isEmailVerified: boolean;
  isOnline: boolean;
  lastActiveDate: string | null;
  lastSeen: string | null;
  level: string | null;
  responsibleLanguageCommunities: string[];
  roleId: number;
  roleName: string | null;
  status: number;
  username: string;
  visitDurationForStaff: number;
  visitDurationSeconds: number;
  phoneNumber?: string;
  totalSpent?: number;
  avgSessionDuration?: number;
}

export interface SubscriptionFeature {
  id: number;
  featureCode: string;
  featureName: string;
  limitValue: string;
  isActive: boolean;
  displayOrder: number;
  valueType: string;
  description?: string;
  isUnlimited?: boolean;
}

export type PackageStatus = "Public" | "Published" | "Draft" | "Archived" | "Hidden";
export type PlanStatus = PackageStatus;

export interface Plan {
  planId: number;
  planName: string;
  description: string;
  priceVnd: number;
  priceUsd: number;
  priceYuan: number;
  createDate: string;
  lastEdited: string;
  status: number; // e.g., 1 Active, 0 Banned/Hidden
  subscriptionCode: string;
  applicableRole: string;
  brandColor: string;
  displayOrder: number;
  iconUrl: string;
  shortDescription: string;
  billingCycle: string;
  allowRenewal: boolean;
  autoRenew: boolean;
  packageStatus: PackageStatus;
  subscriptionFeatures: SubscriptionFeature[];
}

export interface PlanStatisticsDto {
  totalPlans: number;
  displaying: number;
  hidden: number;
  archived: number;
  draft: number;
}

