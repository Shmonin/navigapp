import React from 'react';
import { Icon } from '@/components/ui';

interface PublicPageHeaderProps {
  title: string;
  description?: string;
}

export const PublicPageHeader: React.FC<PublicPageHeaderProps> = ({
  title,
  description
}) => {
  return (
    <header className="bg-[var(--tg-theme-secondary-bg-color)] border-b border-[var(--tg-theme-section-separator-color)]">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--tg-theme-button-color)] flex items-center justify-center">
            <Icon name="Document" size="sm" color="var(--tg-theme-button-text-color)" />
          </div>
          <h1 className="text-xl font-bold text-[var(--tg-theme-text-color)]">
            {title}
          </h1>
        </div>

        {description && (
          <p className="text-[var(--tg-theme-hint-color)] text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </header>
  );
};