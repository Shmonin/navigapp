export interface AnalyticsEvent {
  id: string;
  pageId: string;
  eventType: 'view' | 'click' | 'share';
  cardId?: string;
  userTelegramId?: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: string;
}

export interface AnalyticsViewRequest {
  pageId: string;
  sessionId: string;
  referrer?: string;
}

export interface AnalyticsClickRequest {
  pageId: string;
  cardId: string;
  sessionId: string;
}

export interface PageAnalytics {
  pageId: string;
  period: {
    from: string;
    to: string;
  };
  metrics: {
    totalViews: number;
    totalClicks: number;
    uniqueVisitors: number;
    ctr: number; // Click-through rate
  };
  timeline: {
    date: string;
    views: number;
    clicks: number;
  }[];
  topCards: {
    cardId: string;
    title: string;
    clicks: number;
    ctr: number;
  }[];
  referrers: {
    source: string;
    views: number;
    percentage: number;
  }[];
}