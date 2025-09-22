import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';
import { IconName } from '@/types/icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helpText,
  leftIcon,
  rightIcon,
  onRightIconClick,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 11)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--tg-theme-text-color)]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Icon name={leftIcon} size="sm" color="var(--tg-theme-hint-color)" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-base',
            'bg-[var(--tg-theme-bg-color)]',
            'border border-[var(--tg-theme-section-separator-color)]',
            'text-[var(--tg-theme-text-color)]',
            'placeholder:text-[var(--tg-theme-hint-color)]',
            'rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-[var(--tg-theme-button-color)] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',

            // Отступы для иконок
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',

            // Состояние ошибки
            error && 'border-red-500 focus:ring-red-500',

            className
          )}
          {...props}
        />

        {rightIcon && (
          <div
            className={cn(
              'absolute right-3 top-1/2 transform -translate-y-1/2',
              onRightIconClick ? 'cursor-pointer' : 'pointer-events-none'
            )}
            onClick={onRightIconClick}
          >
            <Icon
              name={rightIcon}
              size="sm"
              color="var(--tg-theme-hint-color)"
              className={onRightIconClick ? 'hover:opacity-70 transition-opacity' : ''}
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <Icon name="InfoCircle" size="xs" />
          {error}
        </p>
      )}

      {helpText && !error && (
        <p className="text-sm text-[var(--tg-theme-hint-color)]">
          {helpText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';