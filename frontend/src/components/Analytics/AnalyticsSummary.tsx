import React from 'react';
import { AnalyticsSummary as AnalyticsSummaryType } from '@/types/analytics';
import { Icon } from '@/components/ui';
import { cn } from '@/utils/cn';

interface AnalyticsSummaryProps {
  summary: AnalyticsSummaryType;
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ summary }) => {
  const metrics = [
    {
      label: 'Всего просмотров',
      value: summary.totalViews,
      change: summary.viewsChange,
      icon: 'Eye',
      color: 'blue',
    },
    {
      label: 'Всего кликов',
      value: summary.totalClicks,
      change: summary.clicksChange,
      icon: 'Click',
      color: 'green',
    },
    {
      label: 'CTR',
      value: summary.clickThroughRate,
      isPercentage: true,
      icon: 'Chart21',
      color: 'purple',
    },
    {
      label: 'Просмотров в день',
      value: summary.avgViewsPerDay,
      icon: 'Calendar',
      color: 'orange',
    },
  ];

  const formatValue = (value: number, isPercentage?: boolean) => {
    if (isPercentage) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    const prefix = isPositive ? '+' : '';
    return `${prefix}${change.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-[var(--tg-theme-hint-color)]';
  };

  return (
    <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
      <h3 className="font-semibold text-[var(--tg-theme-text-color)] mb-4">
        Сводка
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon
                name={metric.icon as any}
                size="sm"
                color={`var(--tg-theme-${metric.color})`}
              />
              {metric.change !== undefined && (
                <span className={cn('text-xs font-medium', getChangeColor(metric.change))}>
                  {formatChange(metric.change)}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-xl font-bold text-[var(--tg-theme-text-color)]">
                {formatValue(metric.value, metric.isPercentage)}
              </p>
              <p className="text-xs text-[var(--tg-theme-hint-color)]">
                {metric.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Дополнительные метрики */}
      <div className="mt-4 pt-4 border-t border-[var(--tg-theme-section-separator-color)]">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--tg-theme-hint-color)]">Кликов в день:</span>
            <span className="ml-2 font-medium text-[var(--tg-theme-text-color)]">
              {summary.avgClicksPerDay.toFixed(1)}
            </span>
          </div>
          <div>
            <span className="text-[var(--tg-theme-hint-color)]">CTR:</span>
            <span className="ml-2 font-medium text-[var(--tg-theme-text-color)]">
              {summary.clickThroughRate.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};