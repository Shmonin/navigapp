import { useToast } from '@/contexts/ToastContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export const useNotifications = () => {
  const { addToast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();

  const showSuccess = (title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    if (hapticFeedback) {
      hapticFeedback('notification', 'success');
    }
    return addToast({
      type: 'success',
      title,
      message,
      action,
    });
  };

  const showError = (title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    if (hapticFeedback) {
      hapticFeedback('notification', 'error');
    }
    return addToast({
      type: 'error',
      title,
      message,
      action,
      duration: 8000, // Ошибки показываем дольше
    });
  };

  const showWarning = (title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    if (hapticFeedback) {
      hapticFeedback('notification', 'warning');
    }
    return addToast({
      type: 'warning',
      title,
      message,
      action,
      duration: 6000,
    });
  };

  const showInfo = (title: string, message?: string, action?: { label: string; onClick: () => void }) => {
    return addToast({
      type: 'info',
      title,
      message,
      action,
    });
  };

  // Предустановленные уведомления для часто используемых сценариев
  const notifications = {
    pageCreated: (pageTitle: string) => showSuccess(
      'Страница создана',
      `"${pageTitle}" успешно создана`
    ),

    pagePublished: (pageTitle: string) => showSuccess(
      'Страница опубликована',
      `"${pageTitle}" теперь доступна по публичной ссылке`
    ),

    pageDeleted: (pageTitle: string) => showInfo(
      'Страница удалена',
      `"${pageTitle}" была удалена`
    ),

    cardAdded: () => showSuccess(
      'Карточка добавлена',
      'Новая карточка успешно создана'
    ),

    subscriptionActivated: () => showSuccess(
      'Pro подписка активирована',
      'Теперь у вас есть доступ ко всем функциям'
    ),

    trialStarted: (daysLeft: number) => showSuccess(
      'Пробный период начался',
      `У вас есть ${daysLeft} дней для знакомства с Pro функциями`
    ),

    trialExpiringSoon: (daysLeft: number) => showWarning(
      'Пробный период заканчивается',
      `Осталось ${daysLeft} дней. Оформите подписку для продолжения`,
      {
        label: 'Оформить подписку',
        onClick: () => {
          // Navigate to subscription
        }
      }
    ),

    limitReached: (limitType: string) => showWarning(
      'Достигнут лимит',
      `${limitType} недоступно в бесплатной версии`,
      {
        label: 'Узнать о Pro',
        onClick: () => {
          // Navigate to subscription
        }
      }
    ),

    syncSuccess: () => showSuccess(
      'Данные синхронизированы',
      'Все изменения сохранены на сервере'
    ),

    syncError: () => showError(
      'Ошибка синхронизации',
      'Проверьте подключение к интернету',
      {
        label: 'Повторить',
        onClick: () => {
          // Retry sync
        }
      }
    ),

    networkError: () => showError(
      'Ошибка сети',
      'Проверьте подключение к интернету'
    ),

    saveError: () => showError(
      'Ошибка сохранения',
      'Не удалось сохранить изменения'
    ),

    copySuccess: () => showSuccess(
      'Скопировано',
      'Ссылка скопирована в буфер обмена'
    ),
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    notifications,
  };
};