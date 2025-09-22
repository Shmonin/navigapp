import React from 'react';
import { UserStats as UserStatsType } from '@/types/user';
import { Icon } from '@/components/ui';
import { cn } from '@/utils/cn';

interface UserStatsProps {
  stats: UserStatsType;
  isProUser: boolean;
}

export const UserStats: React.FC<UserStatsProps> = ({ stats, isProUser }) => {
  const statItems = [
    {
      label: 'Страниц',
      value: stats.pagesCount,
      icon: 'Document',
      color: 'blue',
    },
    {
      label: 'Карточек',
      value: stats.cardsCount,
      icon: 'Category',
      color: 'green',
    },
    {
      label: 'Просмотров',
      value: stats.totalViews,
      icon: 'Eye',
      color: 'purple',
      proOnly: true,
    },
    {
      label: 'Кликов',
      value: stats.totalClicks,
      icon: 'Click',
      color: 'orange',
      proOnly: true,
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
      <h3 className="font-semibold text-[var(--tg-theme-text-color)] mb-4">
        Статистика
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item) => {
          const isLocked = item.proOnly && !isProUser;

          return (
            <div
              key={item.label}
              className={cn(
                'bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-3 relative',
                isLocked && 'opacity-60'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon
                  name={item.icon as any}
                  size="sm"
                  color={isLocked ? 'var(--tg-theme-hint-color)' : `var(--tg-theme-${item.color})`}
                />
                {isLocked && (
                  <Icon
                    name="Crown1"
                    size="xs"
                    color="var(--tg-theme-hint-color)"
                  />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-2xl font-bold text-[var(--tg-theme-text-color)]">
                  {isLocked ? '—' : formatNumber(item.value)}
                </p>
                <p className="text-xs text-[var(--tg-theme-hint-color)]">
                  {item.label}
                </p>
              </div>

              {isLocked && (
                <div className="absolute inset-0 bg-[var(--tg-theme-secondary-bg-color)]/80 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Icon
                      name="Crown1"
                      size="md"
                      color="var(--tg-theme-hint-color)"
                      className="mb-1"
                    />
                    <p className="text-xs text-[var(--tg-theme-hint-color)]">
                      Pro функция
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {stats.activePages > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--tg-theme-section-separator-color)]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--tg-theme-hint-color)]">
              Активных страниц
            </span>
            <span className="text-sm font-medium text-[var(--tg-theme-text-color)]">
              {stats.activePages}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};