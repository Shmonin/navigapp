import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui';
import { LayoutType } from '@/types/page';

interface LayoutOption {
  type: LayoutType;
  name: string;
  description: string;
  icon: string;
  isPro: boolean;
}

const layoutOptions: LayoutOption[] = [
  {
    type: 'vertical',
    name: 'Вертикальный список',
    description: 'Карточки в один столбец',
    icon: 'MenuBoard',
    isPro: false
  },
  {
    type: 'grid',
    name: 'Сетка',
    description: 'Карточки в две колонки',
    icon: 'Grid3',
    isPro: true
  },
  {
    type: 'horizontal',
    name: 'Горизонтальный скролл',
    description: 'Карточки в ряд со скроллом',
    icon: 'ArrowRight',
    isPro: true
  },
  {
    type: 'feed',
    name: 'Лента',
    description: 'Большие карточки-посты',
    icon: 'DocumentText',
    isPro: true
  }
];

interface LayoutSelectorProps {
  selectedLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
  userPlan: 'free' | 'pro';
  className?: string;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  selectedLayout,
  onLayoutChange,
  userPlan,
  className
}) => {
  const handleLayoutSelect = (layout: LayoutType, isPro: boolean) => {
    if (isPro && userPlan === 'free') {
      // Показать модальное окно апгрейда
      // TODO: добавить логику апгрейда
      return;
    }
    onLayoutChange(layout);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
        Тип расположения карточек
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {layoutOptions.map((option) => {
          const isDisabled = option.isPro && userPlan === 'free';
          const isSelected = selectedLayout === option.type;

          return (
            <div
              key={option.type}
              className={cn(
                'relative p-4 border rounded-lg cursor-pointer transition-all',
                'hover:shadow-sm',
                {
                  'border-[var(--tg-theme-button-color)] bg-[var(--tg-theme-button-color)]/10':
                    isSelected && !isDisabled,
                  'border-[var(--tg-theme-section-separator-color)]':
                    !isSelected,
                  'opacity-60 cursor-not-allowed': isDisabled
                }
              )}
              onClick={() => handleLayoutSelect(option.type, option.isPro)}
            >
              {/* Pro бейдж */}
              {option.isPro && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-medium rounded-full">
                  <Icon name="Crown1" size={12} />
                  Pro
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    isSelected && !isDisabled
                      ? 'bg-[var(--tg-theme-button-color)] text-white'
                      : 'bg-[var(--tg-theme-secondary-bg-color)]'
                  )}
                >
                  <Icon
                    name={option.icon as any}
                    size="md"
                    variant={isSelected ? 'Bold' : 'Linear'}
                  />
                </div>

                <div className="flex-1">
                  <h4 className="font-medium text-[var(--tg-theme-text-color)]">
                    {option.name}
                  </h4>
                  <p className="text-sm text-[var(--tg-theme-hint-color)]">
                    {option.description}
                  </p>
                </div>

                {/* Радиокнопка */}
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    {
                      'border-[var(--tg-theme-button-color)] bg-[var(--tg-theme-button-color)]':
                        isSelected && !isDisabled,
                      'border-[var(--tg-theme-hint-color)]':
                        !isSelected || isDisabled
                    }
                  )}
                >
                  {isSelected && !isDisabled && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>

              {/* Блокировка для Free плана */}
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                  <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Доступно в Pro
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};