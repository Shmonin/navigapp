import React from 'react';
import { Icon } from '@/components/ui';

export const PublicPageFooter: React.FC = () => {
  const handleCreateOwnPage = () => {
    // Открыть Navigapp бота в Telegram
    window.open('https://t.me/NavigappBot', '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-[var(--tg-theme-secondary-bg-color)] border-t border-[var(--tg-theme-section-separator-color)]">
      <div className="p-4">
        <div
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-section-separator-color)] cursor-pointer hover:bg-[var(--tg-theme-button-color)] hover:text-[var(--tg-theme-button-text-color)] transition-colors"
          onClick={handleCreateOwnPage}
        >
          <Icon name="Add" size="sm" />
          <span className="text-sm font-medium">
            Создать свою навигацию в Navigapp
          </span>
        </div>

        <div className="text-center mt-3">
          <p className="text-xs text-[var(--tg-theme-hint-color)]">
            Создано с помощью{' '}
            <span className="font-medium text-[var(--tg-theme-link-color)]">
              Navigapp
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};