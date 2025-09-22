import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '@/types/notifications';
import { useToast } from '@/contexts/ToastContext';
import { Icon } from '@/components/ui';
import { cn } from '@/utils/cn';

interface ToastProps {
  toast: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Анимация появления
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: '#10B981',
          icon: 'TickCircle' as const,
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: '#EF4444',
          icon: 'CloseCircle' as const,
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: '#F59E0B',
          icon: 'InfoCircle' as const,
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: '#3B82F6',
          icon: 'InfoCircle' as const,
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: '#6B7280',
          icon: 'InfoCircle' as const,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 transform',
        styles.bgColor,
        styles.borderColor,
        isVisible && !isRemoving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      {/* Иконка */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon
          name={styles.icon}
          size="sm"
          color={styles.iconColor}
        />
      </div>

      {/* Контент */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 mb-1">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {toast.message}
          </p>
        )}

        {/* Действие */}
        {toast.action && (
          <button
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
            onClick={() => {
              toast.action!.onClick();
              handleRemove();
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Кнопка закрытия */}
      <button
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        onClick={handleRemove}
      >
        <Icon name="CloseCircle" size="sm" />
      </button>
    </div>
  );
};