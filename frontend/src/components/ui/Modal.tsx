import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  className
}) => {
  const { backButton, hapticFeedback } = useTelegramWebApp();

  // Управление BackButton для закрытия модального окна
  useEffect(() => {
    if (!backButton) return;

    if (isOpen) {
      backButton.show();
      backButton.onClick(() => {
        if (hapticFeedback) {
          hapticFeedback('impact', 'light');
        }
        onClose();
      });
    } else {
      backButton.hide();
    }

    return () => {
      if (backButton) {
        backButton.hide();
      }
    };
  }, [isOpen, backButton, onClose, hapticFeedback]);

  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      if (hapticFeedback) {
        hapticFeedback('impact', 'light');
      }
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          'w-full bg-[var(--tg-theme-bg-color)] rounded-t-xl sm:rounded-xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col',
          'animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200',

          // Размеры
          {
            'sm:max-w-sm': size === 'sm',
            'sm:max-w-md': size === 'md',
            'sm:max-w-lg': size === 'lg',
            'sm:max-w-xl': size === 'xl',
          },

          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-[var(--tg-theme-section-separator-color)]">
            {title && (
              <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                className="ml-auto p-2 hover:bg-[var(--tg-theme-secondary-bg-color)] rounded-full transition-colors"
                onClick={onClose}
                aria-label="Закрыть"
              >
                <Icon name="CloseCircle" size="sm" />
              </button>
            )}
          </div>
        )}

        {/* Контент */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};