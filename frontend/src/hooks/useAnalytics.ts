import { useState, useEffect } from 'react';
import { AnalyticsData, AnalyticsFilter } from '@/types/analytics';
import { analyticsApi } from '@/services/api';

export const useAnalytics = (pageId: string, initialFilter: AnalyticsFilter) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [filter, setFilter] = useState<AnalyticsFilter>(initialFilter);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    if (!pageId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await analyticsApi.getPageAnalytics(pageId, filter.period);
      setAnalytics(data as AnalyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilter = (newFilter: AnalyticsFilter) => {
    setFilter(newFilter);
  };

  const trackPageView = async (metadata?: Record<string, any>) => {
    try {
      await analyticsApi.trackPageView(pageId, metadata);
    } catch (err) {
      console.error('Error tracking page view:', err);
    }
  };

  const trackCardClick = async (cardId: string, metadata?: Record<string, any>) => {
    try {
      await analyticsApi.trackCardClick(cardId, metadata);
    } catch (err) {
      console.error('Error tracking card click:', err);
    }
  };

  // Загружаем данные при изменении pageId или фильтра
  useEffect(() => {
    loadAnalytics();
  }, [pageId, filter]);

  // Функция для форматирования данных для графиков
  const getChartData = (type: 'views' | 'clicks') => {
    if (!analytics) return { labels: [], datasets: [] };

    const data = type === 'views' ? analytics.views : analytics.clicks;
    const labels = data.map(item =>
      new Date(item.date).toLocaleDateString('ru-RU', {
        month: 'short',
        day: 'numeric'
      })
    );

    return {
      labels,
      datasets: [{
        label: type === 'views' ? 'Просмотры' : 'Клики',
        data: data.map(item => item.value),
        borderColor: type === 'views' ? '#3B82F6' : '#10B981',
        backgroundColor: type === 'views' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        fill: true,
      }]
    };
  };

  // Функция для получения сравнительных данных
  const getComparisonData = () => {
    if (!analytics) return null;

    const { summary } = analytics;
    return {
      viewsChange: summary.viewsChange,
      clicksChange: summary.clicksChange,
      ctrCurrent: summary.clickThroughRate,
      avgViews: summary.avgViewsPerDay,
      avgClicks: summary.avgClicksPerDay,
    };
  };

  // Функция для экспорта данных
  const exportData = (format: 'csv' | 'json') => {
    if (!analytics) return;

    const data = {
      period: filter.period,
      summary: analytics.summary,
      views: analytics.views,
      clicks: analytics.clicks,
      topCards: analytics.topCards,
      exportedAt: new Date().toISOString(),
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${pageId}-${filter.period}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      // Простой CSV экспорт для просмотров и кликов
      const csvData = [
        ['Дата', 'Просмотры', 'Клики'],
        ...analytics.views.map((view, index) => [
          view.date,
          view.value.toString(),
          (analytics.clicks[index]?.value || 0).toString()
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${pageId}-${filter.period}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return {
    analytics,
    filter,
    isLoading,
    error,
    updateFilter,
    refreshAnalytics: loadAnalytics,
    trackPageView,
    trackCardClick,
    getChartData,
    getComparisonData,
    exportData,
  };
};