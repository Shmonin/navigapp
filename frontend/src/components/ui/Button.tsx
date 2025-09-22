import React from 'react';
import { cn } from '@/utils/cn';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Icon } from './Icon';
import { IconName } from '@/types/icons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  haptic?: 'light' | 'medium' | 'heavy';
  fullWidth?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  haptic = 'medium',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  children,
  onClick,
  disabled,
  className,
  ...props
}) => {
  const { hapticFeedback } = useTelegramWebApp();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && hapticFeedback) {
      hapticFeedback('impact', haptic);
    }
    onClick?.(e);
  };

  const renderIcon = () => {
    if (isLoading) {
      return <Icon name="Refresh" size={size === 'sm' ? 'xs' : 'sm'} className="animate-spin" />;
    }

    if (icon) {
      return <Icon name={icon} size={size === 'sm' ? 'xs' : 'sm'} variant="Bold" />;
    }

    return null;
  };

  return (
    <button
      className={cn(
        // Базовые стили
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',

        // Размеры
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },

        // Варианты
        {
          'bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] hover:opacity-90 focus:ring-[var(--tg-theme-button-color)]': variant === 'primary',
          'bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] hover:bg-opacity-80 focus:ring-[var(--tg-theme-hint-color)]': variant === 'secondary',
          'bg-transparent text-[var(--tg-theme-link-color)] hover:bg-[var(--tg-theme-secondary-bg-color)] focus:ring-[var(--tg-theme-link-color)]': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500': variant === 'danger',
        },

        // Полная ширина
        fullWidth && 'w-full',

        // Состояние загрузки
        isLoading && 'cursor-wait',

        className
      )}
      onClick={handleClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {iconPosition === 'left' && renderIcon()}
      <span className={cn(isLoading && 'opacity-0')}>{children}</span>
      {iconPosition === 'right' && renderIcon()}
    </button>
  );
};