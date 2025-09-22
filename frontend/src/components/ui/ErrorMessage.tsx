import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import { cn } from '@/utils/cn';

interface ErrorMessageProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  action,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center text-center max-w-sm mx-auto',
      className
    )}>
      <div className="w-16 h-16 rounded-full bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center mb-4">
        <Icon
          name="InfoCircle"
          size="lg"
          color="var(--tg-theme-hint-color)"
        />
      </div>

      <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)] mb-2">
        {title}
      </h3>

      <p className="text-[var(--tg-theme-hint-color)] mb-6 leading-relaxed">
        {message}
      </p>

      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};