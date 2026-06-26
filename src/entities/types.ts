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
  packageStatus: string;
  subscriptionFeatures: SubscriptionFeature[];
}
