import React from 'react';
import { Icon } from './Icon';
import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className
}) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Icon
        name="Refresh"
        size={size}
        className="animate-spin"
        color="var(--tg-theme-hint-color)"
      />
    </div>
  );
};