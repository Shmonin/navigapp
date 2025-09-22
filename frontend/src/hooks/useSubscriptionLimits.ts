import { useMemo } from 'react';
import { LayoutType } from '@/types/page';

export type SubscriptionPlan = 'free' | 'pro';

interface SubscriptionLimits {
  maxPages: number;
  maxCardsPerPage: number;
  allowedLayouts: LayoutType[];
  canUseInternalPages: boolean;
  canUseAnalytics: boolean;
  canUseCustomDomain: boolean;
}

const subscriptionLimits: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    maxPages: 1,
    maxCardsPerPage: 8,
    allowedLayouts: ['vertical'],
    canUseInternalPages: false,
    canUseAnalytics: false,
    canUseCustomDomain: false
  },
  pro: {
    maxPages: Infinity,
    maxCardsPerPage: Infinity,
    allowedLayouts: ['vertical', 'grid', 'horizontal', 'feed'],
    canUseInternalPages: true,
    canUseAnalytics: true,
    canUseCustomDomain: true
  }
};

interface UseSubscriptionLimitsProps {
  plan: SubscriptionPlan;
  currentPageCount?: number;
  currentCardCount?: number;
}

export const useSubscriptionLimits = ({
  plan,
  currentPageCount = 0,
  currentCardCount = 0
}: UseSubscriptionLimitsProps) => {
  const limits = subscriptionLimits[plan];

  const canCreatePage = useMemo(() => {
    return currentPageCount < limits.maxPages;
  }, [currentPageCount, limits.maxPages]);

  const canCreateCard = useMemo(() => {
    return currentCardCount < limits.maxCardsPerPage;
  }, [currentCardCount, limits.maxCardsPerPage]);

  const isLayoutAllowed = (layout: LayoutType) => {
    return limits.allowedLayouts.includes(layout);
  };

  const getUpgradeReason = (action: 'create_page' | 'create_card' | 'use_layout' | 'use_internal' | 'use_analytics') => {
    switch (action) {
      case 'create_page':
        return !canCreatePage ? `Достигнут лимит страниц (${limits.maxPages})` : null;
      case 'create_card':
        return !canCreateCard ? `Достигнут лимит карточек (${limits.maxCardsPerPage} на страницу)` : null;
      case 'use_layout':
        return 'Дополнительные типы размещения доступны в Pro';
      case 'use_internal':
        return 'Внутренние страницы доступны в Pro';
      case 'use_analytics':
        return 'Аналитика доступна в Pro';
      default:
        return null;
    }
  };

  return {
    limits,
    canCreatePage,
    canCreateCard,
    isLayoutAllowed,
    getUpgradeReason,
    isPro: plan === 'pro',
    isFree: plan === 'free'
  };
};