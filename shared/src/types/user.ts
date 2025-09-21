export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  subscriptionType: 'free' | 'pro';
  subscriptionExpiresAt?: string;
  trialUsed: boolean;
  totalPagesCreated: number;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  subscriptionType: 'free' | 'pro';
  subscriptionExpiresAt?: string;
  trialUsed: boolean;
  totalPagesCreated: number;
  limits: SubscriptionLimits;
}

export interface SubscriptionLimits {
  maxPages: number; // -1 for unlimited
  maxCardsPerPage: number; // -1 for unlimited
  allowedBlockTypes: BlockType[];
  canCreateInternalPages: boolean;
  hasAnalytics: boolean;
}

export type BlockType = 'vertical_list' | 'grid' | 'horizontal_scroll' | 'feed';