import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui';
import { Card, LayoutType } from '@/types/page';

interface CardPreviewProps {
  card: Card;
  layout: LayoutType;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  card,
  layout,
  onClick,
  onEdit,
  onDelete,
  className
}) => {
  const getCardClasses = () => {
    const baseClasses = 'relative group transition-all duration-200 cursor-pointer';

    switch (layout) {
      case 'vertical':
        return cn(
          baseClasses,
          'flex items-center gap-3 p-4 bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-section-separator-color)] rounded-lg hover:shadow-sm hover:border-[var(--tg-theme-button-color)]/30'
        );

      case 'grid':
        return cn(
          baseClasses,
          'p-4 bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-section-separator-color)] rounded-lg text-center hover:shadow-sm hover:border-[var(--tg-theme-button-color)]/30'
        );

      case 'horizontal':
        return cn(
          baseClasses,
          'flex-shrink-0 w-40 p-3 bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-section-separator-color)] rounded-lg text-center hover:shadow-sm hover:border-[var(--tg-theme-button-color)]/30'
        );

      case 'feed':
        return cn(
          baseClasses,
          'p-6 bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-section-separator-color)] rounded-xl hover:shadow-sm hover:border-[var(--tg-theme-button-color)]/30'
        );

      default:
        return baseClasses;
    }
  };

  const renderIcon = () => {
    if (card.iconUrl) {
      return (
        <img
          src={card.iconUrl}
          alt=""
          className={cn(
            'object-cover rounded',
            layout === 'feed' ? 'w-12 h-12' : 'w-8 h-8'
          )}
        />
      );
    }

    if (card.iconName) {
      return (
        <Icon
          name={card.iconName}
          size={layout === 'feed' ? 'xl' : 'lg'}
          variant="Linear"
        />
      );
    }

    return (
      <div className={cn(
        'bg-[var(--tg-theme-secondary-bg-color)] rounded flex items-center justify-center',
        layout === 'feed' ? 'w-12 h-12' : 'w-8 h-8'
      )}>
        <Icon
          name="DocumentText"
          size={layout === 'feed' ? 'md' : 'sm'}
          color="var(--tg-theme-hint-color)"
        />
      </div>
    );
  };

  const renderContent = () => {
    switch (layout) {
      case 'vertical':
        return (
          <>
            {renderIcon()}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[var(--tg-theme-text-color)] truncate">
                {card.title}
              </h3>
              {card.description && (
                <p className="text-sm text-[var(--tg-theme-hint-color)] truncate">
                  {card.description}
                </p>
              )}
            </div>
            <Icon
              name="ArrowRight"
              size="sm"
              color="var(--tg-theme-hint-color)"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </>
        );

      case 'grid':
        return (
          <div className="space-y-2">
            <div className="flex justify-center">
              {renderIcon()}
            </div>
            <div>
              <h3 className="font-medium text-[var(--tg-theme-text-color)] text-sm truncate">
                {card.title}
              </h3>
              {card.description && (
                <p className="text-xs text-[var(--tg-theme-hint-color)] truncate">
                  {card.description}
                </p>
              )}
            </div>
          </div>
        );

      case 'horizontal':
        return (
          <div className="space-y-2">
            <div className="flex justify-center">
              {renderIcon()}
            </div>
            <div>
              <h3 className="font-medium text-[var(--tg-theme-text-color)] text-sm truncate">
                {card.title}
              </h3>
            </div>
          </div>
        );

      case 'feed':
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {renderIcon()}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--tg-theme-text-color)] text-lg">
                  {card.title}
                </h3>
                {card.description && (
                  <p className="text-[var(--tg-theme-hint-color)] mt-1">
                    {card.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn(getCardClasses(), className)} onClick={onClick}>
      {renderContent()}

      {/* Действия при наведении */}
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              className="p-1 bg-white shadow-md rounded-full hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Редактировать"
            >
              <Icon name="Edit2" size="xs" />
            </button>
          )}
          {onDelete && (
            <button
              className="p-1 bg-white shadow-md rounded-full hover:bg-red-50 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Удалить"
            >
              <Icon name="Trash" size="xs" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};