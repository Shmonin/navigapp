import React, { useState, useEffect } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { usePages } from '@/hooks/usePages';
import { useToast } from '@/contexts/ToastContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button, Icon } from '@/components/ui';
import { CreatePageForm } from '@/components/PageBuilder/CreatePageForm';
import { CreateCardForm } from '@/components/PageBuilder/CreateCardForm';
import { LayoutSelector } from '@/components/PageBuilder/LayoutSelector';
import { CardPreview } from '@/components/PageBuilder/CardPreview';
import { Page, CreatePageData, CreateCardData, LayoutType } from '@/types/page';
import { cn } from '@/utils/cn';

export const PageBuilder: React.FC = () => {
  const { mainButton, hapticFeedback } = useTelegramWebApp();
  const { addToast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuthContext();

  // Состояние
  const [showCreatePageForm, setShowCreatePageForm] = useState(false);
  const [showCreateCardForm, setShowCreateCardForm] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('vertical');
  const [isLoading, setIsLoading] = useState(false);

  // API интеграция
  const {
    pages,
    createPage,
    updatePage,
    createCard,
    publishPage,
    isOnline,
    hasUnsyncedChanges
  } = usePages(user?.id || '');

  // Ограничения подписки
  const {
    limits,
    canCreatePage,
    canCreateCard,
    isLayoutAllowed,
    getUpgradeReason,
    isFree
  } = useSubscriptionLimits({
    plan: user?.subscriptionType || 'free',
    currentPageCount: pages.length,
    currentCardCount: currentPage?.blocks[0]?.cards.length || 0
  });

  // Установка текущей страницы при загрузке
  useEffect(() => {
    if (pages.length > 0 && !currentPage) {
      setCurrentPage(pages[0]);
      setSelectedLayout(pages[0].blocks[0]?.layout || 'vertical');
    }
  }, [pages, currentPage]);

  // Обработчики
  const handleCreatePage = async (data: CreatePageData) => {
    console.log('🔥 PageBuilder: Starting page creation');
    setIsLoading(true);

    try {
      const newPage = await createPage(data);
      console.log('🔥 PageBuilder: Page created successfully:', newPage);

      setCurrentPage(newPage);
      setShowCreatePageForm(false);

      addToast({
        type: 'success',
        title: 'Страница создана',
        message: `Страница "${data.title}" успешно создана`,
        duration: 3000
      });

      if (hapticFeedback) {
        hapticFeedback('impact', 'medium');
      }
    } catch (error) {
      console.error('🔥 PageBuilder: Error creating page:', error);

      addToast({
        type: 'error',
        title: 'Ошибка создания страницы',
        message: 'Не удалось создать страницу. Попробуйте еще раз.',
        duration: 5000
      });

      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
    } finally {
      setIsLoading(false);
      console.log('🔥 PageBuilder: Page creation process completed');
    }
  };

  const handleCreateCard = async (data: CreateCardData) => {
    console.log('🔥 handleCreateCard called with data:', data);

    if (!currentPage) {
      console.error('🔥 No current page found');
      return;
    }

    console.log('🔥 Current page:', currentPage);
    console.log('🔥 Setting loading to true');
    setIsLoading(true);

    try {
      // Use new createCard method instead of updatePage
      const blockId = currentPage.blocks[0].id;
      console.log('🔥 Calling createCard API with blockId:', blockId);

      const newCard = await createCard(currentPage.id, blockId, data);
      console.log('🔥 createCard API call successful:', newCard);

      // Update current page state (should already be updated by createCard hook)
      const updatedPage = pages.find(p => p.id === currentPage.id);
      if (updatedPage) {
        setCurrentPage(updatedPage);
        console.log('🔥 Current page state updated');
      }

      setShowCreateCardForm(false);
      console.log('🔥 Form closed');

      if (hapticFeedback) {
        hapticFeedback('impact', 'light');
        console.log('🔥 Haptic feedback triggered');
      }

      console.log('🔥 Card creation completed successfully');
    } catch (error) {
      console.error('🔥 Error creating card:', error);
      console.error('🔥 Error details:', error instanceof Error ? error.message : String(error));
    } finally {
      console.log('🔥 Setting loading to false');
      setIsLoading(false);
    }
  };

  const handleLayoutChange = async (layout: LayoutType) => {
    if (!currentPage) return;

    if (!isLayoutAllowed(layout)) {
      // Показать уведомление об ограничении
      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
      return;
    }

    setSelectedLayout(layout);

    const updatedPage = {
      ...currentPage,
      blocks: [{
        ...currentPage.blocks[0],
        layout
      }],
      updatedAt: new Date().toISOString()
    };

    try {
      await updatePage(currentPage.id, updatedPage);
      setCurrentPage(updatedPage);

      if (hapticFeedback) {
        hapticFeedback('impact', 'light');
      }
    } catch (error) {
      console.error('Error updating layout:', error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!currentPage) return;

    const updatedCards = currentPage.blocks[0].cards.filter(card => card.id !== cardId);
    const updatedPage = {
      ...currentPage,
      blocks: [{
        ...currentPage.blocks[0],
        cards: updatedCards.map((card, index) => ({ ...card, order: index }))
      }],
      updatedAt: new Date().toISOString()
    };

    try {
      await updatePage(currentPage.id, updatedPage);
      setCurrentPage(updatedPage);

      if (hapticFeedback) {
        hapticFeedback('impact', 'light');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handlePublishPage = async () => {
    if (!currentPage || currentPage.blocks[0].cards.length === 0) return;

    setIsLoading(true);
    try {
      const publishedPage = await publishPage(currentPage.id);
      setCurrentPage(publishedPage);

      if (hapticFeedback) {
        hapticFeedback('notification', 'success');
      }
    } catch (error) {
      console.error('Error publishing page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Настройка MainButton
  React.useEffect(() => {
    if (!mainButton || !currentPage) return;

    const hasCards = currentPage.blocks[0].cards.length > 0;
    const isPublished = currentPage.isPublished;

    if (hasCards && !isPublished) {
      mainButton.setText('Опубликовать страницу');
      mainButton.show();
      mainButton.onClick(handlePublishPage);
    } else if (isPublished) {
      mainButton.setText('Страница опубликована ✓');
      mainButton.show();
    } else {
      mainButton.hide();
    }

    return () => {
      if (mainButton) {
        mainButton.hide();
      }
    };
  }, [mainButton, currentPage, isLoading]);

  const currentCardCount = currentPage?.blocks[0]?.cards.length || 0;

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[var(--tg-theme-button-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[var(--tg-theme-text-color)]">Авторизация...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm mx-auto p-4">
            <Icon name="Warning2" size="xl" color="var(--tg-theme-destructive-text-color)" className="mb-4" />
            <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)] mb-2">
              Ошибка авторизации
            </h2>
            <p className="text-[var(--tg-theme-hint-color)] mb-4">
              Не удалось авторизоваться через Telegram
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">
      <div className="flex-1 p-4 space-y-6">
        {/* Заголовок */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)] mb-2">
            Создание навигации
          </h1>
          <p className="text-[var(--tg-theme-hint-color)]">
            {currentPage
              ? 'Добавьте карточки для создания навигации'
              : 'Создайте свою первую страницу навигации'
            }
          </p>

          {/* Статус подключения */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isOnline ? "bg-green-500" : "bg-red-500"
            )} />
            <span className="text-xs text-[var(--tg-theme-hint-color)]">
              {isOnline ? 'Онлайн' : 'Оффлайн'}
            </span>
            {hasUnsyncedChanges && (
              <span className="text-xs text-yellow-600">
                • Есть несохраненные изменения
              </span>
            )}
          </div>
        </div>

        {!currentPage ? (
          /* Создание первой страницы */
          <div className="text-center py-12">
            <div className="mb-6">
              <Icon name="Document" size="2xl" color="var(--tg-theme-hint-color)" />
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
                Начнем создание
              </h2>
              <p className="text-[var(--tg-theme-hint-color)]">
                В бесплатной версии вы можете создать одну страницу с до 8 карточек
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowCreatePageForm(true)}
                disabled={!canCreatePage}
              >
                {canCreatePage ? 'Создать страницу' : getUpgradeReason('create_page')}
              </Button>
            </div>
          </div>
        ) : (
          /* Редактирование страницы */
          <div className="space-y-6">
            {/* Информация о странице */}
            <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
                  {currentPage.title}
                </h2>
                <div className="flex items-center gap-2">
                  {currentPage.isPublished ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <Icon name="TickCircle" size="xs" />
                      Опубликовано
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      <Icon name="Clock" size="xs" />
                      Черновик
                    </span>
                  )}
                </div>
              </div>
              {currentPage.description && (
                <p className="text-[var(--tg-theme-hint-color)]">
                  {currentPage.description}
                </p>
              )}
            </div>

            {/* Селектор layout */}
            <LayoutSelector
              selectedLayout={selectedLayout}
              onLayoutChange={handleLayoutChange}
              userPlan={user?.subscriptionType || 'free'}
            />

            {/* Карточки */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
                  Карточки ({currentCardCount}/{isFree ? limits.maxCardsPerPage : '∞'})
                </h3>

                <Button
                  variant="primary"
                  size="sm"
                  icon="Add"
                  onClick={() => setShowCreateCardForm(true)}
                  disabled={!canCreateCard}
                >
                  {canCreateCard ? 'Добавить' : 'Лимит достигнут'}
                </Button>
              </div>

              {currentCardCount === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-[var(--tg-theme-section-separator-color)] rounded-lg">
                  <Icon name="Add" size="xl" color="var(--tg-theme-hint-color)" className="mb-3" />
                  <p className="text-[var(--tg-theme-hint-color)]">
                    Добавьте первую карточку для начала
                  </p>
                </div>
              ) : (
                <div
                  className={cn(
                    'gap-3',
                    {
                      'space-y-3': selectedLayout === 'vertical',
                      'grid grid-cols-2 gap-3': selectedLayout === 'grid',
                      'flex gap-3 overflow-x-auto pb-2': selectedLayout === 'horizontal',
                      'space-y-4': selectedLayout === 'feed'
                    }
                  )}
                >
                  {currentPage.blocks[0].cards.map((card) => (
                    <CardPreview
                      key={card.id}
                      card={card}
                      layout={selectedLayout}
                      onDelete={() => handleDeleteCard(card.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Формы */}
      <CreatePageForm
        isOpen={showCreatePageForm}
        onClose={() => setShowCreatePageForm(false)}
        onSubmit={handleCreatePage}
        isLoading={isLoading}
      />

      <CreateCardForm
        isOpen={showCreateCardForm}
        onClose={() => setShowCreateCardForm(false)}
        onSubmit={handleCreateCard}
        isLoading={isLoading}
        maxCards={isFree ? limits.maxCardsPerPage : undefined}
        currentCardCount={currentCardCount}
      />
    </div>
  );
};