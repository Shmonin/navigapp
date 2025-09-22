export interface AnalyticsData {
  pageId: string;
  period: '7d' | '30d' | '90d';
  views: AnalyticsMetric[];
  clicks: AnalyticsMetric[];
  topCards: CardAnalytics[];
  summary: AnalyticsSummary;
}

export interface AnalyticsMetric {
  date: string;
  value: number;
}

export interface CardAnalytics {
  cardId: string;
  cardTitle: string;
  clicks: number;
  clickRate: number;
  position: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  avgViewsPerDay: number;
  avgClicksPerDay: number;
  viewsChange: number;
  clicksChange: number;
}

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'card_click';
  pageId: string;
  cardId?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsFilter {
  period: '7d' | '30d' | '90d';
  startDate?: string;
  endDate?: string;
  pageId?: string;
  cardId?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill?: boolean;
  }[];
}