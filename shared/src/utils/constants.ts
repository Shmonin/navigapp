import { SubscriptionLimits, BlockType } from '../types/index.js';

export const SUBSCRIPTION_LIMITS: Record<'free' | 'pro', SubscriptionLimits> = {
  free: {
    maxPages: 1,
    maxCardsPerPage: 8,
    allowedBlockTypes: ['vertical_list'] as BlockType[],
    canCreateInternalPages: false,
    hasAnalytics: false,
  },
  pro: {
    maxPages: -1, // unlimited
    maxCardsPerPage: -1, // unlimited
    allowedBlockTypes: ['vertical_list', 'grid', 'horizontal_scroll', 'feed'] as BlockType[],
    canCreateInternalPages: true,
    hasAnalytics: true,
  },
};

export const SUBSCRIPTION_PRICES = {
  trial: 100, // 1 рубль в копейках
  monthly: 29900, // 299 рублей в копейках
  yearly: 299000, // 2990 рублей в копейках
} as const;

export const JWT_EXPIRES_IN = {
  accessToken: '1h',
  refreshToken: '30d',
} as const;

export const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
  maxLimit: 50,
} as const;