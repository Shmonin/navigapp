import React from 'react';
import { AnalyticsMetric } from '@/types/analytics';
import { cn } from '@/utils/cn';

interface AnalyticsChartProps {
  data: AnalyticsMetric[];
  title: string;
  color: string;
  type?: 'line' | 'bar';
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  title,
  color,
  type = 'line'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
        <h3 className="font-semibold text-[var(--tg-theme-text-color)] mb-4">
          {title}
        </h3>
        <div className="text-center py-8">
          <p className="text-[var(--tg-theme-hint-color)]">
            Нет данных для отображения
          </p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 0;
    return Math.max(4, (value / maxValue) * 100);
  };

  const getLinePoints = () => {
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((point.value - minValue) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
      <h3 className="font-semibold text-[var(--tg-theme-text-color)] mb-4">
        {title}
      </h3>

      <div className="relative">
        {/* График */}
        <div className="h-32 mb-4 relative bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-2">
          {type === 'bar' ? (
            /* Столбчатый график */
            <div className="flex items-end justify-between h-full">
              {data.map((point, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center justify-end mx-0.5"
                >
                  <div
                    className="w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${getBarHeight(point.value)}%`,
                      backgroundColor: color,
                      opacity: 0.8,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* Линейный график */
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Область под линией */}
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
              </defs>

              <polygon
                fill={`url(#gradient-${color})`}
                points={`0,100 ${getLinePoints()} 100,100`}
              />

              {/* Линия */}
              <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={getLinePoints()}
              />

              {/* Точки */}
              {data.map((point, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((point.value - minValue) / range) * 100;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="2"
                    fill={color}
                  />
                );
              })}
            </svg>
          )}
        </div>

        {/* Подписи дат */}
        <div className="flex justify-between text-xs text-[var(--tg-theme-hint-color)]">
          {data.map((point, index) => {
            // Показываем только каждую n-ую дату для избежания наложения
            const shouldShow = data.length <= 7 || index % Math.ceil(data.length / 7) === 0 || index === data.length - 1;

            return (
              <span
                key={index}
                className={cn(
                  'transition-opacity',
                  shouldShow ? 'opacity-100' : 'opacity-0'
                )}
              >
                {formatDate(point.date)}
              </span>
            );
          })}
        </div>
      </div>

      {/* Статистика */}
      <div className="flex justify-between items-center pt-3 border-t border-[var(--tg-theme-section-separator-color)]">
        <div>
          <p className="text-sm text-[var(--tg-theme-hint-color)]">Максимум</p>
          <p className="font-semibold text-[var(--tg-theme-text-color)]">
            {maxValue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-[var(--tg-theme-hint-color)]">Среднее</p>
          <p className="font-semibold text-[var(--tg-theme-text-color)]">
            {Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-[var(--tg-theme-hint-color)]">Всего</p>
          <p className="font-semibold text-[var(--tg-theme-text-color)]">
            {data.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};