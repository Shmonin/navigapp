import React from 'react';
import { Card, LayoutType } from '@/types/page';
import { Icon } from '@/components/ui';
import { analyticsApi } from '@/services/api';
import { cn } from '@/utils/cn';

interface PublicCardProps {
  card: Card;
  layout: LayoutType;
}

export const PublicCard: React.FC<PublicCardProps> = ({ card, layout }) => {
  const handleCardClick = async () => {
    try {
      // Отслеживание клика по карточке
      await analyticsApi.trackCardClick(card.id, {
        source: 'public_view',
        timestamp: new Date().toISOString()
      });

      // Открытие ссылки
      if (card.url) {
        if (card.type === 'internal') {
          // Для внутренних ссылок используем navigation (будет реализовано с роутингом)
          console.log('Navigate to internal page:', card.url);
        } else {
          // Для внешних ссылок открываем через Telegram WebApp
          if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openLink(card.url);
          } else {
            // Fallback для браузера
            window.open(card.url, '_blank', 'noopener,noreferrer');
          }
        }
      }
    } catch (error) {
      console.error('Error tracking card click:', error);
      // Все равно переходим по ссылке даже если аналитика не сработала
      if (card.url && card.type === 'external') {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.openLink(card.url);
        } else {
          window.open(card.url, '_blank', 'noopener,noreferrer');
        }
      }
    }
  };

  const getCardSize = () => {
    switch (layout) {
      case 'feed':
        return 'large';
      case 'horizontal':
        return 'medium';
      default:
        return 'default';
    }
  };

  const cardSize = getCardSize();

  return (
    <div
      className={cn(
        'bg-[var(--tg-theme-bg-color)] rounded-lg shadow-sm border border-[var(--tg-theme-section-separator-color)]',
        'hover:shadow-md transition-all duration-200 cursor-pointer',
        'active:scale-95 active:bg-[var(--tg-theme-secondary-bg-color)]',
        {
          'p-3': cardSize === 'default',
          'p-4': cardSize === 'medium',
          'p-6': cardSize === 'large',
        }
      )}
      onClick={handleCardClick}
    >
      <div className={cn(
        'flex items-start gap-3',
        {
          'flex-col text-center': layout === 'feed',
          'flex-row': layout !== 'feed',
        }
      )}>
        {/* Иконка */}
        <div className={cn(
          'flex-shrink-0 rounded-lg flex items-center justify-center',
          'bg-[var(--tg-theme-button-color)]',
          {
            'w-8 h-8': cardSize === 'default',
            'w-10 h-10': cardSize === 'medium',
            'w-12 h-12': cardSize === 'large',
          },
          layout === 'feed' && 'mx-auto'
        )}>
          {card.iconUrl ? (
            <img
              src={card.iconUrl}
              alt={card.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : card.iconName ? (
            <Icon
              name={card.iconName}
              size={cardSize === 'large' ? 'lg' : cardSize === 'medium' ? 'md' : 'sm'}
              color="var(--tg-theme-button-text-color)"
              variant="Bold"
            />
          ) : (
            <Icon
              name="Link21"
              size={cardSize === 'large' ? 'lg' : cardSize === 'medium' ? 'md' : 'sm'}
              color="var(--tg-theme-button-text-color)"
              variant="Bold"
            />
          )}
        </div>

        {/* Контент */}
        <div className={cn(
          'flex-1 min-w-0',
          layout === 'feed' && 'text-center'
        )}>
          <h3 className={cn(
            'font-semibold text-[var(--tg-theme-text-color)] mb-1',
            {
              'text-sm': cardSize === 'default',
              'text-base': cardSize === 'medium',
              'text-lg': cardSize === 'large',
            }
          )}>
            {card.title}
          </h3>

          {card.description && (
            <p className={cn(
              'text-[var(--tg-theme-hint-color)] line-clamp-2',
              {
                'text-xs': cardSize === 'default',
                'text-sm': cardSize === 'medium' || cardSize === 'large',
              }
            )}>
              {card.description}
            </p>
          )}

          {/* Индикатор типа ссылки */}
          {card.type === 'external' && (
            <div className="flex items-center gap-1 mt-2">
              <Icon
                name="Link21"
                size="xs"
                color="var(--tg-theme-hint-color)"
              />
              <span className="text-xs text-[var(--tg-theme-hint-color)]">
                Внешняя ссылка
              </span>
            </div>
          )}
        </div>

        {/* Стрелка для горизонтального и вертикального layout */}
        {(layout === 'vertical' || layout === 'horizontal') && (
          <div className="flex-shrink-0">
            <Icon
              name="ArrowRight"
              size="sm"
              color="var(--tg-theme-hint-color)"
            />
          </div>
        )}
      </div>
    </div>
  );
};