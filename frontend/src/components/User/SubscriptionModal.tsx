import React, { useState } from 'react';
import { Modal, Button, Icon } from '@/components/ui';
import { cn } from '@/utils/cn';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTrial: () => Promise<void>;
  onPurchasePro: (plan: 'monthly' | 'yearly') => Promise<void>;
  isLoading?: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onStartTrial,
  onPurchasePro,
  isLoading = false
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'trial' | 'monthly' | 'yearly'>('trial');

  const handleSubmit = async () => {
    try {
      if (selectedPlan === 'trial') {
        await onStartTrial();
      } else {
        await onPurchasePro(selectedPlan);
      }
      onClose();
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const plans = [
    {
      id: 'trial' as const,
      title: 'Пробный период',
      subtitle: '7 дней бесплатно',
      price: 'Бесплатно',
      priceDetail: 'Затем 199₽/мес',
      features: [
        'Все Pro функции',
        'Неограниченные страницы',
        'Все типы раскладок',
        'Аналитика',
      ],
      popular: true,
    },
    {
      id: 'monthly' as const,
      title: 'Месячная подписка',
      subtitle: 'Оплата каждый месяц',
      price: '199₽',
      priceDetail: 'в месяц',
      features: [
        'Все Pro функции',
        'Неограниченные страницы',
        'Все типы раскладок',
        'Аналитика',
        'Приоритетная поддержка',
      ],
    },
    {
      id: 'yearly' as const,
      title: 'Годовая подписка',
      subtitle: 'Экономия 30%',
      price: '1699₽',
      priceDetail: 'в год (141₽/мес)',
      features: [
        'Все Pro функции',
        'Неограниченные страницы',
        'Все типы раскладок',
        'Аналитика',
        'Приоритетная поддержка',
        'Скидка 30%',
      ],
      badge: 'Выгодно',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Выберите подписку"
      size="lg"
    >
      <div className="space-y-4">
        {/* Планы */}
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'border rounded-lg p-4 cursor-pointer transition-all relative',
                selectedPlan === plan.id
                  ? 'border-[var(--tg-theme-button-color)] bg-[var(--tg-theme-button-color)]/10'
                  : 'border-[var(--tg-theme-section-separator-color)]'
              )}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {/* Популярный/Выгодный бейдж */}
              {(plan.popular || plan.badge) && (
                <div className="absolute -top-2 left-4">
                  <span className="bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] text-xs font-medium px-2 py-1 rounded-full">
                    {plan.badge || 'Популярно'}
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[var(--tg-theme-text-color)]">
                      {plan.title}
                    </h3>
                    {selectedPlan === plan.id && (
                      <Icon
                        name="TickCircle"
                        size="sm"
                        color="var(--tg-theme-button-color)"
                      />
                    )}
                  </div>
                  <p className="text-sm text-[var(--tg-theme-hint-color)] mb-2">
                    {plan.subtitle}
                  </p>

                  {/* Цена */}
                  <div className="mb-3">
                    <span className="text-xl font-bold text-[var(--tg-theme-text-color)]">
                      {plan.price}
                    </span>
                    <span className="text-sm text-[var(--tg-theme-hint-color)] ml-1">
                      {plan.priceDetail}
                    </span>
                  </div>

                  {/* Функции */}
                  <div className="space-y-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Icon
                          name="TickCircle"
                          size="xs"
                          color="green"
                        />
                        <span className="text-sm text-[var(--tg-theme-text-color)]">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Кнопка действия */}
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          isLoading={isLoading}
          icon={selectedPlan === 'trial' ? 'Clock' : 'MoneyRecive'}
        >
          {selectedPlan === 'trial'
            ? 'Начать пробный период'
            : 'Оформить подписку'
          }
        </Button>

        {/* Дополнительная информация */}
        <div className="text-center space-y-2">
          <p className="text-xs text-[var(--tg-theme-hint-color)]">
            {selectedPlan === 'trial'
              ? 'Отменить можно в любое время. Автоматическое продление не включено.'
              : 'Безопасная оплата через Telegram. Отменить можно в любое время.'
            }
          </p>

          {selectedPlan !== 'trial' && (
            <p className="text-xs text-[var(--tg-theme-hint-color)]">
              При оплате вы соглашаетесь с условиями использования и политикой конфиденциальности
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};