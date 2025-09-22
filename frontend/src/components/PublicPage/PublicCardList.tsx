import React from 'react';
import { Card, LayoutType } from '@/types/page';
import { PublicCard } from './PublicCard';
import { cn } from '@/utils/cn';

interface PublicCardListProps {
  cards: Card[];
  layout: LayoutType;
  title?: string;
}

export const PublicCardList: React.FC<PublicCardListProps> = ({
  cards,
  layout,
  title
}) => {
  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  const getLayoutStyles = () => {
    switch (layout) {
      case 'vertical':
        return 'space-y-3';
      case 'grid':
        return 'grid grid-cols-2 gap-3';
      case 'horizontal':
        return 'flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory';
      case 'feed':
        return 'space-y-4';
      default:
        return 'space-y-3';
    }
  };

  const getCardClassName = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex-shrink-0 w-64 snap-start';
      default:
        return '';
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)] mb-4">
          {title}
        </h2>
      )}

      <div className={cn(getLayoutStyles())}>
        {sortedCards.map((card) => (
          <div key={card.id} className={getCardClassName()}>
            <PublicCard
              card={card}
              layout={layout}
            />
          </div>
        ))}
      </div>

      {sortedCards.length === 0 && (
        <div className="text-center py-8 text-[var(--tg-theme-hint-color)]">
          Карточки не найдены
        </div>
      )}
    </div>
  );
};