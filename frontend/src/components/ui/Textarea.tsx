import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helpText,
  resize = 'vertical',
  className,
  id,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 11)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-[var(--tg-theme-text-color)]"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
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
          'min-h-[80px]',

          // Размер изменения
          {
            'resize-none': resize === 'none',
            'resize-y': resize === 'vertical',
            'resize-x': resize === 'horizontal',
            resize: resize === 'both',
          },

          // Состояние ошибки
          error && 'border-red-500 focus:ring-red-500',

          className
        )}
        {...props}
      />

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

Textarea.displayName = 'Textarea';