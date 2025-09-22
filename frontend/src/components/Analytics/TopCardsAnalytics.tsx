import React from 'react';
import { CardAnalytics } from '@/types/analytics';
import { Icon } from '@/components/ui';

interface TopCardsAnalyticsProps {
  cards: CardAnalytics[];
  maxItems?: number;
}

export const TopCardsAnalytics: React.FC<TopCardsAnalyticsProps> = ({
  cards,
  maxItems = 5
}) => {
  const sortedCards = cards
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, maxItems);

  if (sortedCards.length === 0) {
    return (
      <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
        <h3 className="font-semibold text-[var(--tg-theme-text-color)] mb-4">
          Популярные карточки
        </h3>
        <div className="text-center py-8">
          <p className="text-[var(--tg-theme-hint-color)]">
            Нет данных о кликах по карточкам
          </p>
        </div>
      </div>
    );
  }

  const maxClicks = Math.max(...sortedCards.map(card => card.clicks));

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return { icon: 'Crown1', color: 'gold' };
      case 2:
        return { icon: 'Award', color: 'silver' };
      case 3:
        return { icon: 'Medal', color: 'bronze' };
      default:
        return { icon: 'Category', color: 'var(--tg-theme-hint-color)' };
    }
  };

  const getClickRate = (clicks: number) => {
    if (maxClicks === 0) return 0;
    return (clicks / maxClicks) * 100;
  };

  return (
    <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
      <h3 className="font-semibold text-[var(--tg-theme-text-color)] mb-4">
        Популярные карточки
      </h3>

      <div className="space-y-3">
        {sortedCards.map((card, index) => {
          const position = index + 1;
          const positionInfo = getPositionIcon(position);
          const clickRate = getClickRate(card.clicks);

          return (
            <div
              key={card.cardId}
              className="bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Icon
                      name={positionInfo.icon as any}
                      size="sm"
                      color={positionInfo.color}
                    />
                    <span className="text-sm font-medium text-[var(--tg-theme-text-color)]">
                      #{position}
                    </span>
                  </div>
                  <h4 className="font-medium text-[var(--tg-theme-text-color)] truncate">
                    {card.cardTitle}
                  </h4>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--tg-theme-text-color)]">
                    {card.clicks}
                  </p>
                  <p className="text-xs text-[var(--tg-theme-hint-color)]">
                    кликов
                  </p>
                </div>
              </div>

              {/* Полоса прогресса */}
              <div className="mb-2">
                <div className="h-2 bg-[var(--tg-theme-bg-color)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--tg-theme-button-color)] transition-all duration-300"
                    style={{ width: `${clickRate}%` }}
                  />
                </div>
              </div>

              {/* Дополнительная статистика */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--tg-theme-hint-color)]">
                  CTR: {card.clickRate.toFixed(1)}%
                </span>
                <span className="text-[var(--tg-theme-hint-color)]">
                  Позиция в списке: {card.position}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {cards.length > maxItems && (
        <div className="mt-4 text-center">
          <p className="text-sm text-[var(--tg-theme-hint-color)]">
            Показаны топ {maxItems} из {cards.length} карточек
          </p>
        </div>
      )}
    </div>
  );
};