import React, { useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { Button, Icon } from '@/components/ui';
import { CreatePageForm } from '@/components/PageBuilder/CreatePageForm';
import { CreateCardForm } from '@/components/PageBuilder/CreateCardForm';
import { LayoutSelector } from '@/components/PageBuilder/LayoutSelector';
import { CardPreview } from '@/components/PageBuilder/CardPreview';
import { Page, Card, CreatePageData, CreateCardData, LayoutType } from '@/types/page';
import { cn } from '@/utils/cn';

// Моковые данные для демонстрации
const mockUser = {
  id: '1',
  plan: 'free' as const,
  pagesCount: 0
};

export const PageBuilder: React.FC = () => {
  const { mainButton, hapticFeedback } = useTelegramWebApp();

  // Состояние
  const [showCreatePageForm, setShowCreatePageForm] = useState(false);
  const [showCreateCardForm, setShowCreateCardForm] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('vertical');
  const [isLoading, setIsLoading] = useState(false);

  // Ограничения подписки
  const {
    limits,
    canCreatePage,
    canCreateCard,
    isLayoutAllowed,
    getUpgradeReason,
    isFree
  } = useSubscriptionLimits({
    plan: mockUser.plan,
    currentPageCount: mockUser.pagesCount,
    currentCardCount: currentPage?.blocks[0]?.cards.length || 0
  });

  // Обработчики
  const handleCreatePage = async (data: CreatePageData) => {
    setIsLoading(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newPage: Page = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        isPublished: false,
        blocks: [{
          id: '1',
          type: 'cards',
          title: 'Навигация',
          layout: selectedLayout,
          cards: [],
          order: 0
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCurrentPage(newPage);

      if (hapticFeedback) {
        hapticFeedback('impact', 'medium');
      }
    } catch (error) {
      console.error('Error creating page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCard = async (data: CreateCardData) => {
    if (!currentPage) return;

    setIsLoading(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 500));

      const newCard: Card = {
        id: Date.now().toString(),
        title: data.title,
        description: data.description,
        iconName: data.iconName,
        iconUrl: data.iconUrl,
        url: data.url,
        type: data.type,
        order: currentPage.blocks[0].cards.length
      };

      const updatedPage = {
        ...currentPage,
        blocks: [{
          ...currentPage.blocks[0],
          cards: [...currentPage.blocks[0].cards, newCard]
        }],
        updatedAt: new Date().toISOString()
      };

      setCurrentPage(updatedPage);

      if (hapticFeedback) {
        hapticFeedback('impact', 'light');
      }
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLayoutChange = (layout: LayoutType) => {
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

    setCurrentPage(updatedPage);

    if (hapticFeedback) {
      hapticFeedback('impact', 'light');
    }
  };

  const handleDeleteCard = (cardId: string) => {
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

    setCurrentPage(updatedPage);

    if (hapticFeedback) {
      hapticFeedback('impact', 'light');
    }
  };

  const handlePublishPage = async () => {
    if (!currentPage || currentPage.blocks[0].cards.length === 0) return;

    setIsLoading(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));

      const publishedPage = {
        ...currentPage,
        isPublished: true,
        updatedAt: new Date().toISOString()
      };

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
              userPlan={mockUser.plan}
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