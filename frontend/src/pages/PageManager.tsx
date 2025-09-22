import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { usePages } from '@/hooks/usePages';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { PagesList } from '@/components/PageManager/PagesList';
import { PageEditor } from '@/components/PageManager/PageEditor';
import { CreatePageForm } from '@/components/PageBuilder/CreatePageForm';
import { Button, Icon, LoadingSpinner, ErrorMessage, Modal } from '@/components/ui';
import { Page, CreatePageData } from '@/types/page';

export const PageManager: React.FC = () => {
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegramWebApp();
  const { user } = useUser();

  const {
    pages,
    createPage,
    updatePage,
    deletePage,
    publishPage,
    isLoading: pagesLoading,
    error: pagesError,
    refreshPages
  } = usePages(user?.id || '');

  const {
    canCreatePage,
    canCreateCard,
    isLayoutAllowed,
    limits,
    isFree
  } = useSubscriptionLimits({
    plan: user?.subscriptionType || 'free',
    currentPageCount: pages.length,
    currentCardCount: 0 // Будет обновляться для выбранной страницы
  });

  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showCreatePageForm, setShowCreatePageForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Если нет страниц и пользователь может создать страницу, показываем форму создания
  const shouldShowCreateForm = pages.length === 0 && canCreatePage;

  const handlePageSelect = (page: Page) => {
    setSelectedPage(page);
  };

  const handleCreatePage = async (data: CreatePageData) => {
    setIsLoading(true);
    try {
      const newPage = await createPage(data);
      setSelectedPage(newPage);
      setShowCreatePageForm(false);

      if (hapticFeedback) {
        hapticFeedback('impact', 'medium');
      }
    } catch (error) {
      console.error('Error creating page:', error);
      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePage = async (updates: Partial<Page>) => {
    if (!selectedPage) return;

    try {
      const updatedPage = await updatePage(selectedPage.id, updates);
      setSelectedPage(updatedPage);

      if (hapticFeedback) {
        hapticFeedback('impact', 'light');
      }
    } catch (error) {
      console.error('Error updating page:', error);
      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
    }
  };

  const handlePublishPage = async () => {
    if (!selectedPage) return;

    try {
      const publishedPage = await publishPage(selectedPage.id);
      setSelectedPage(publishedPage);

      if (hapticFeedback) {
        hapticFeedback('notification', 'success');
      }
    } catch (error) {
      console.error('Error publishing page:', error);
      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
    }
  };

  const handleUnpublishPage = async () => {
    if (!selectedPage) return;

    try {
      const unpublishedPage = await updatePage(selectedPage.id, { isPublished: false });
      setSelectedPage(unpublishedPage);

      if (hapticFeedback) {
        hapticFeedback('impact', 'medium');
      }
    } catch (error) {
      console.error('Error unpublishing page:', error);
      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
    }
  };

  const handleDeletePage = (page: Page) => {
    setPageToDelete(page);
    setShowDeleteModal(true);
  };

  const confirmDeletePage = async () => {
    if (!pageToDelete) return;

    setIsLoading(true);
    try {
      await deletePage(pageToDelete.id);

      // Если удаляется выбранная страница, сбрасываем выбор
      if (selectedPage?.id === pageToDelete.id) {
        setSelectedPage(null);
      }

      setShowDeleteModal(false);
      setPageToDelete(null);

      if (hapticFeedback) {
        hapticFeedback('impact', 'medium');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      if (hapticFeedback) {
        hapticFeedback('notification', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageAnalytics = (page: Page) => {
    navigate(`/analytics/${page.id}`);
  };

  if (pagesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (pagesError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ErrorMessage
          title="Ошибка загрузки"
          message={pagesError}
          action={{
            label: 'Попробовать снова',
            onClick: refreshPages
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color)]">
      <div className="p-4 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)]">
              Управление страницами
            </h1>
            <p className="text-[var(--tg-theme-hint-color)]">
              Создавайте и редактируйте свои страницы навигации
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon="Setting2"
            onClick={() => navigate('/settings')}
          />
        </div>

        {shouldShowCreateForm ? (
          /* Экран создания первой страницы */
          <div className="text-center py-12">
            <div className="mb-6">
              <Icon name="Document" size="2xl" color="var(--tg-theme-hint-color)" />
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
                Создайте свою первую страницу
              </h2>
              <p className="text-[var(--tg-theme-hint-color)]">
                Начните создание навигации для вашего сообщества
              </p>
              <Button
                variant="primary"
                fullWidth
                onClick={() => setShowCreatePageForm(true)}
              >
                Создать страницу
              </Button>
            </div>
          </div>
        ) : (
          /* Главный интерфейс */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Список страниц */}
            <div className="lg:col-span-1">
              <PagesList
                pages={pages}
                selectedPageId={selectedPage?.id}
                onPageSelect={handlePageSelect}
                onPageEdit={handlePageSelect}
                onPageDelete={handleDeletePage}
                onPageAnalytics={handlePageAnalytics}
                onCreatePage={() => setShowCreatePageForm(true)}
                canCreatePage={canCreatePage}
                isProUser={user?.subscriptionType === 'pro'}
              />
            </div>

            {/* Редактор страницы */}
            <div className="lg:col-span-2">
              {selectedPage ? (
                <PageEditor
                  page={selectedPage}
                  onUpdatePage={handleUpdatePage}
                  onPublishPage={handlePublishPage}
                  onUnpublishPage={handleUnpublishPage}
                  canCreateCard={canCreateCard}
                  isLayoutAllowed={isLayoutAllowed}
                  isLoading={isLoading}
                  maxCards={isFree ? limits.maxCardsPerPage : undefined}
                />
              ) : (
                <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-8 text-center">
                  <Icon name="Document" size="2xl" color="var(--tg-theme-hint-color)" className="mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)] mb-2">
                    Выберите страницу для редактирования
                  </h3>
                  <p className="text-[var(--tg-theme-hint-color)]">
                    Выберите страницу из списка слева или создайте новую
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Форма создания страницы */}
      <CreatePageForm
        isOpen={showCreatePageForm}
        onClose={() => setShowCreatePageForm(false)}
        onSubmit={handleCreatePage}
        isLoading={isLoading}
      />

      {/* Модал подтверждения удаления */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Удалить страницу"
      >
        <div className="space-y-4">
          <p className="text-[var(--tg-theme-text-color)]">
            Вы уверены, что хотите удалить страницу{' '}
            <strong>"{pageToDelete?.title}"</strong>?
          </p>
          <p className="text-[var(--tg-theme-hint-color)] text-sm">
            Это действие нельзя отменить. Все карточки и аналитика будут безвозвратно утеряны.
          </p>

          <div className="flex gap-3">
            <Button
              variant="danger"
              fullWidth
              onClick={confirmDeletePage}
              isLoading={isLoading}
              icon="Trash"
            >
              Удалить
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowDeleteModal(false)}
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};