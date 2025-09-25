export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  subscriptionType: 'free' | 'pro';
  subscriptionStatus?: 'active' | 'inactive' | 'trial' | 'expired';
  subscriptionExpiresAt?: string;
  trialExpiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'free' | 'pro';
  status: 'active' | 'inactive' | 'trial' | 'expired' | 'cancelled';
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  paymentMethod?: 'telegram_stars' | 'card';
  amount?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  pagesCount: number;
  cardsCount: number;
  totalViews: number;
  totalClicks: number;
  activePages: number;
}

export interface SubscriptionLimits {
  maxPages: number;
  maxCardsPerPage: number;
  allowedLayouts: ('vertical' | 'grid' | 'horizontal' | 'feed')[];
  hasAnalytics: boolean;
  hasCustomDomain: boolean;
  hasPrioritySupport: boolean;
}

export const PLAN_LIMITS: Record<'free' | 'pro', SubscriptionLimits> = {
  free: {
    maxPages: 1,
    maxCardsPerPage: 8,
    allowedLayouts: ['vertical'],
    hasAnalytics: false,
    hasCustomDomain: false,
    hasPrioritySupport: false,
  },
  pro: {
    maxPages: Infinity,
    maxCardsPerPage: Infinity,
    allowedLayouts: ['vertical', 'grid', 'horizontal', 'feed'],
    hasAnalytics: true,
    hasCustomDomain: true,
    hasPrioritySupport: true,
  },
};