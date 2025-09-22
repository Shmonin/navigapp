import React from 'react';
import { User } from '@/types/user';
import { Button, Icon } from '@/components/ui';

interface UserProfileProps {
  user: User;
  onUpgrade: () => void;
  onStartTrial: () => void;
  trialDaysLeft: number;
  subscriptionDaysLeft: number;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpgrade,
  onStartTrial,
  trialDaysLeft,
  subscriptionDaysLeft,
  isTrialActive,
  isSubscriptionActive
}) => {
  const getStatusBadge = () => {
    if (isTrialActive) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          <Icon name="Clock" size="xs" />
          Пробный период ({trialDaysLeft} дн.)
        </div>
      );
    }

    if (isSubscriptionActive) {
      return (
        <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          <Icon name="Crown1" size="xs" />
          Pro активен ({subscriptionDaysLeft} дн.)
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
        <Icon name="Profile" size="xs" />
        Бесплатный план
      </div>
    );
  };

  const getPlanDescription = () => {
    if (user.subscriptionType === 'pro') {
      return isTrialActive
        ? 'У вас есть доступ ко всем Pro функциям в рамках пробного периода'
        : 'У вас есть доступ ко всем Pro функциям';
    }

    return 'Создавайте до 1 страницы с 8 карточками';
  };

  return (
    <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4 space-y-4">
      {/* Заголовок профиля */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--tg-theme-button-color)] flex items-center justify-center">
            <Icon
              name="Profile"
              size="lg"
              color="var(--tg-theme-button-text-color)"
              variant="Bold"
            />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--tg-theme-text-color)]">
              {user.firstName || user.username || 'Пользователь'}
            </h3>
            <p className="text-sm text-[var(--tg-theme-hint-color)]">
              @{user.username || 'username'}
            </p>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      {/* Описание плана */}
      <div className="bg-[var(--tg-theme-secondary-bg-color)] rounded-lg p-3">
        <p className="text-sm text-[var(--tg-theme-text-color)]">
          {getPlanDescription()}
        </p>
      </div>

      {/* Действия */}
      <div className="space-y-2">
        {user.subscriptionType === 'free' && !isTrialActive && (
          <>
            <Button
              variant="primary"
              fullWidth
              icon="Crown1"
              onClick={onStartTrial}
            >
              Попробовать Pro бесплатно (7 дней)
            </Button>
            <Button
              variant="secondary"
              fullWidth
              icon="MoneyRecive"
              onClick={onUpgrade}
            >
              Купить Pro подписку
            </Button>
          </>
        )}

        {isTrialActive && (
          <Button
            variant="primary"
            fullWidth
            icon="MoneyRecive"
            onClick={onUpgrade}
          >
            Продлить Pro подписку
          </Button>
        )}

        {user.subscriptionType === 'pro' && isSubscriptionActive && !isTrialActive && (
          <div className="text-center">
            <p className="text-sm text-[var(--tg-theme-hint-color)]">
              Подписка активна до {new Date(user.subscriptionExpiresAt!).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Преимущества Pro */}
      {user.subscriptionType === 'free' && (
        <div className="border-t border-[var(--tg-theme-section-separator-color)] pt-4">
          <h4 className="font-medium text-[var(--tg-theme-text-color)] mb-3">
            Преимущества Pro:
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon name="TickCircle" size="sm" color="green" />
              <span className="text-sm text-[var(--tg-theme-text-color)]">
                Неограниченное количество страниц
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="TickCircle" size="sm" color="green" />
              <span className="text-sm text-[var(--tg-theme-text-color)]">
                Все типы раскладок (сетка, горизонтальная, лента)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="TickCircle" size="sm" color="green" />
              <span className="text-sm text-[var(--tg-theme-text-color)]">
                Аналитика просмотров и кликов
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="TickCircle" size="sm" color="green" />
              <span className="text-sm text-[var(--tg-theme-text-color)]">
                Приоритетная поддержка
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};