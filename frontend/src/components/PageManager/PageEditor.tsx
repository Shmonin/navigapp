import React, { useState, useEffect } from 'react';
import { Page, CreateCardData, LayoutType } from '@/types/page';
import { CreateCardForm } from '@/components/PageBuilder/CreateCardForm';
import { LayoutSelector } from '@/components/PageBuilder/LayoutSelector';
import { CardPreview } from '@/components/PageBuilder/CardPreview';
import { Button, Icon, Input, Textarea } from '@/components/ui';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { cn } from '@/utils/cn';

interface PageEditorProps {
  page: Page;
  onUpdatePage: (updates: Partial<Page>) => Promise<void>;
  onPublishPage: () => Promise<void>;
  onUnpublishPage: () => Promise<void>;
  canCreateCard: boolean;
  isLayoutAllowed: (layout: LayoutType) => boolean;
  isLoading?: boolean;
  maxCards?: number;
}

export const PageEditor: React.FC<PageEditorProps> = ({
  page,
  onUpdatePage,
  onPublishPage,
  onUnpublishPage,
  canCreateCard,
  isLayoutAllowed,
  isLoading = false,
  maxCards
}) => {
  const { hapticFeedback } = useTelegramWebApp();

  const [showCreateCardForm, setShowCreateCardForm] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [localTitle, setLocalTitle] = useState(page.title);
  const [localDescription, setLocalDescription] = useState(page.description || '');

  useEffect(() => {
    setLocalTitle(page.title);
    setLocalDescription(page.description || '');
  }, [page]);

  const mainBlock = page.blocks[0];
  const currentCardCount = mainBlock?.cards.length || 0;

  const handleTitleSave = async () => {
    if (localTitle.trim() && localTitle !== page.title) {
      await onUpdatePage({ title: localTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = async () => {
    if (localDescription !== (page.description || '')) {
      await onUpdatePage({ description: localDescription.trim() || undefined });
    }
    setIsEditingDescription(false);
  };

  const handleCreateCard = async (data: CreateCardData) => {
    const newCard = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      iconName: data.iconName,
      iconUrl: data.iconUrl,
      url: data.url,
      type: data.type,
      order: currentCardCount
    };

    const updatedBlocks = page.blocks.map(block => {
      if (block.id === mainBlock.id) {
        return {
          ...block,
          cards: [...block.cards, newCard]
        };
      }
      return block;
    });

    await onUpdatePage({ blocks: updatedBlocks });
    setShowCreateCardForm(false);

    if (hapticFeedback) {
      hapticFeedback('impact', 'light');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    const updatedCards = mainBlock.cards
      .filter(card => card.id !== cardId)
      .map((card, index) => ({ ...card, order: index }));

    const updatedBlocks = page.blocks.map(block => {
      if (block.id === mainBlock.id) {
        return {
          ...block,
          cards: updatedCards
        };
      }
      return block;
    });

    await onUpdatePage({ blocks: updatedBlocks });

    if (hapticFeedback) {
      hapticFeedback('impact', 'light');
    }
  };

  const handleLayoutChange = async (layout: LayoutType) => {
    if (!isLayoutAllowed(layout)) {
      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
      return;
    }

    const updatedBlocks = page.blocks.map(block => {
      if (block.id === mainBlock.id) {
        return {
          ...block,
          layout
        };
      }
      return block;
    });

    await onUpdatePage({ blocks: updatedBlocks });

    if (hapticFeedback) {
      hapticFeedback('impact', 'light');
    }
  };

  const handlePublishToggle = async () => {
    if (page.isPublished) {
      await onUnpublishPage();
    } else {
      await onPublishPage();
    }

    if (hapticFeedback) {
      hapticFeedback('notification', page.isPublished ? 'warning' : 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок страницы */}
      <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
            Редактирование страницы
          </h2>
          <div className="flex items-center gap-2">
            {page.isPublished ? (
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

        {/* Редактирование заголовка */}
        <div className="space-y-3">
          {isEditingTitle ? (
            <div className="flex gap-2">
              <Input
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                placeholder="Название страницы"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  }
                }}
                autoFocus
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleTitleSave}
                disabled={!localTitle.trim()}
              >
                Сохранить
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalTitle(page.title);
                  setIsEditingTitle(false);
                }}
              >
                Отмена
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--tg-theme-text-color)]">
                {page.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                icon="Edit2"
                onClick={() => setIsEditingTitle(true)}
              />
            </div>
          )}

          {/* Редактирование описания */}
          {isEditingDescription ? (
            <div className="space-y-2">
              <Textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                placeholder="Описание страницы (необязательно)"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDescriptionSave}
                >
                  Сохранить
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLocalDescription(page.description || '');
                    setIsEditingDescription(false);
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {page.description ? (
                <p className="text-[var(--tg-theme-hint-color)]">
                  {page.description}
                </p>
              ) : (
                <p className="text-[var(--tg-theme-hint-color)] italic">
                  Нет описания
                </p>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon="Edit2"
                onClick={() => setIsEditingDescription(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Селектор layout */}
      {mainBlock && (
        <LayoutSelector
          selectedLayout={mainBlock.layout}
          onLayoutChange={handleLayoutChange}
          userPlan="free" // Будет передаваться из props
        />
      )}

      {/* Карточки */}
      <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
            Карточки ({currentCardCount}{maxCards ? `/${maxCards}` : ''})
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
                'space-y-3': mainBlock.layout === 'vertical',
                'grid grid-cols-2 gap-3': mainBlock.layout === 'grid',
                'flex gap-3 overflow-x-auto pb-2': mainBlock.layout === 'horizontal',
                'space-y-4': mainBlock.layout === 'feed'
              }
            )}
          >
            {mainBlock.cards.map((card) => (
              <CardPreview
                key={card.id}
                card={card}
                layout={mainBlock.layout}
                onDelete={() => handleDeleteCard(card.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Действия публикации */}
      <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--tg-theme-text-color)]">
              Публикация
            </h3>
            <p className="text-sm text-[var(--tg-theme-hint-color)]">
              {page.isPublished
                ? 'Страница доступна по публичной ссылке'
                : 'Опубликуйте страницу для доступа по ссылке'
              }
            </p>
          </div>

          <Button
            variant={page.isPublished ? 'secondary' : 'primary'}
            onClick={handlePublishToggle}
            disabled={isLoading || currentCardCount === 0}
            icon={page.isPublished ? 'EyeSlash' : 'Eye'}
          >
            {page.isPublished ? 'Снять с публикации' : 'Опубликовать'}
          </Button>
        </div>

        {page.isPublished && (
          <div className="mt-4 p-3 bg-[var(--tg-theme-secondary-bg-color)] rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--tg-theme-text-color)]">
                  Публичная ссылка:
                </p>
                <p className="text-sm text-[var(--tg-theme-link-color)] break-all">
                  {window.location.origin}/p/{page.slug}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon="Share"
                onClick={() => {
                  const url = `${window.location.origin}/p/${page.slug}`;
                  if (navigator.share) {
                    navigator.share({
                      title: page.title,
                      url: url
                    });
                  } else {
                    navigator.clipboard.writeText(url);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Форма создания карточки */}
      <CreateCardForm
        isOpen={showCreateCardForm}
        onClose={() => setShowCreateCardForm(false)}
        onSubmit={handleCreateCard}
        isLoading={isLoading}
        maxCards={maxCards}
        currentCardCount={currentCardCount}
      />
    </div>
  );
};