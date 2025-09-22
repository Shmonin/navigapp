import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { UserProfile } from '@/components/User/UserProfile';
import { UserStats } from '@/components/User/UserStats';
import { SubscriptionModal } from '@/components/User/SubscriptionModal';
import { Button, LoadingSpinner, ErrorMessage } from '@/components/ui';

export const UserSettings: React.FC = () => {
  const { hapticFeedback } = useTelegramWebApp();
  const {
    user,
    userStats,
    isLoading,
    error,
    startTrial,
    isTrialActive,
    isSubscriptionActive,
    trialDaysLeft,
    subscriptionDaysLeft,
    refreshUser
  } = useUser();

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const handleStartTrial = async () => {
    setSubscriptionLoading(true);
    try {
      await startTrial();
      if (hapticFeedback) {
        hapticFeedback('notification', 'success');
      }
    } catch (error) {
      console.error('Trial start error:', error);
      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handlePurchasePro = async (plan: 'monthly' | 'yearly') => {
    setSubscriptionLoading(true);
    try {
      // Интеграция с Telegram Stars или другой платежной системой
      console.log('Purchase Pro:', plan);

      // Симуляция успешной покупки
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (hapticFeedback) {
        hapticFeedback('notification', 'success');
      }

      await refreshUser();
    } catch (error) {
      console.error('Purchase error:', error);
      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscriptionAction = () => {
    if (user?.subscriptionType === 'free' && !isTrialActive) {
      setShowSubscriptionModal(true);
    } else {
      // Для активных пользователей показываем модал управления подпиской
      setShowSubscriptionModal(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ErrorMessage
          title="Ошибка загрузки"
          message={error || 'Не удалось загрузить данные пользователя'}
          action={{
            label: 'Попробовать снова',
            onClick: refreshUser
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">
      <div className="p-4 space-y-6">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)] mb-2">
            Настройки
          </h1>
          <p className="text-[var(--tg-theme-hint-color)]">
            Управление аккаунтом и подпиской
          </p>
        </div>

        {/* Профиль пользователя */}
        <UserProfile
          user={user}
          onUpgrade={handleSubscriptionAction}
          onStartTrial={handleStartTrial}
          trialDaysLeft={trialDaysLeft}
          subscriptionDaysLeft={subscriptionDaysLeft}
          isTrialActive={isTrialActive}
          isSubscriptionActive={isSubscriptionActive}
        />

        {/* Статистика */}
        {userStats && (
          <UserStats
            stats={userStats}
            isProUser={user.subscriptionType === 'pro' && isSubscriptionActive}
          />
        )}

        {/* Дополнительные настройки */}
        <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-[var(--tg-theme-text-color)]">
            Настройки
          </h3>

          <div className="space-y-2">
            <Button
              variant="ghost"
              fullWidth
              icon="Share"
              className="justify-start"
              onClick={() => {
                // Поделиться приложением
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.openLink('https://t.me/NavigappBot');
                }
              }}
            >
              Поделиться приложением
            </Button>

            <Button
              variant="ghost"
              fullWidth
              icon="InfoCircle"
              className="justify-start"
              onClick={() => {
                // Открыть справку
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.openLink('https://navigapp.help');
                }
              }}
            >
              Справка и поддержка
            </Button>

            <Button
              variant="ghost"
              fullWidth
              icon="DocumentText"
              className="justify-start"
              onClick={() => {
                // Открыть условия использования
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.openLink('https://navigapp.terms');
                }
              }}
            >
              Условия использования
            </Button>
          </div>
        </div>

        {/* Информация о версии */}
        <div className="text-center">
          <p className="text-xs text-[var(--tg-theme-hint-color)]">
            Navigapp v1.0.0
          </p>
          <p className="text-xs text-[var(--tg-theme-hint-color)]">
            Создано с ❤️ для Telegram
          </p>
        </div>
      </div>

      {/* Модал подписки */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onStartTrial={handleStartTrial}
        onPurchasePro={handlePurchasePro}
        isLoading={subscriptionLoading}
      />
    </div>
  );
};