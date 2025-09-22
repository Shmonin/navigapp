import React from 'react';
import { AnalyticsFilter } from '@/types/analytics';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';

interface AnalyticsFiltersProps {
  filter: AnalyticsFilter;
  onFilterChange: (filter: AnalyticsFilter) => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filter,
  onFilterChange
}) => {
  const periods = [
    { value: '7d' as const, label: '7 дней' },
    { value: '30d' as const, label: '30 дней' },
    { value: '90d' as const, label: '90 дней' },
  ];

  const handlePeriodChange = (period: '7d' | '30d' | '90d') => {
    onFilterChange({
      ...filter,
      period,
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
      <h3 className="font-semibold text-[var(--tg-theme-text-color)] mb-3">
        Период
      </h3>

      <div className="flex gap-2">
        {periods.map((period) => (
          <Button
            key={period.value}
            variant={filter.period === period.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handlePeriodChange(period.value)}
            className={cn(
              'flex-1',
              filter.period === period.value && 'shadow-sm'
            )}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Дополнительные фильтры могут быть добавлены здесь */}
      {/* Например, выбор конкретных дат, фильтр по страницам и т.д. */}
    </div>
  );
};