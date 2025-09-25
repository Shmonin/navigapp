import { useState, useEffect } from 'react';
import { Page, CreatePageData, CreateCardData, Card } from '@/types/page';
import { pagesApi, cardsApi } from '@/services/api';
import { offlineStorage } from '@/services/offline';
import { generateSimpleId } from '@/utils/uuid';

export const usePages = (userId: string) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (offlineStorage.getIsOnline()) {
        const pagesFromApi = await pagesApi.getPages(userId);
        setPages(pagesFromApi);
        offlineStorage.savePages(pagesFromApi);
      } else {
        const pagesFromStorage = offlineStorage.getPages();
        setPages(pagesFromStorage);
      }
    } catch (err) {
      console.error('Error loading pages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pages');

      const pagesFromStorage = offlineStorage.getPages();
      setPages(pagesFromStorage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadPages();
    }
  }, [userId]);

  const createPage = async (data: CreatePageData): Promise<Page> => {
    try {
      console.log('🔥 Creating page:', data);

      // Defensive checks
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid page data provided');
      }

      const title = data.title?.toString?.() || 'Untitled Page';
      const description = data.description?.toString?.() || '';

      // Всегда создаем страницу локально сначала
      const newPage: Page = {
        id: generateSimpleId(),
        title,
        description,
        slug: title.toLowerCase().replace(/\s+/g, '-') + '-' + generateSimpleId(),
        isPublished: false,
        blocks: [{
          id: '1',
          type: 'cards',
          title: 'Навигация',
          layout: 'vertical',
          cards: [],
          order: 0
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('🔥 Created local page:', newPage);

      // Безопасно добавляем страницу в состояние
      try {
        setPages(prev => {
          if (!Array.isArray(prev)) {
            console.warn('🔥 Pages state corrupted, resetting to empty array');
            const updated = [newPage];
            console.log('🔥 Updated pages state:', updated);
            return updated;
          }
          const updated = [...prev, newPage];
          console.log('🔥 Updated pages state:', updated);
          return updated;
        });
      } catch (stateError) {
        console.error('🔥 Error updating pages state:', stateError);
        // Продолжаем выполнение, страница все равно сохранится в storage
      }

      // Безопасно сохраняем в storage
      try {
        offlineStorage.savePage(newPage);
      } catch (storageError) {
        console.error('🔥 Error saving to storage:', storageError);
        // Не критично, продолжаем
      }

      // Пытаемся синхронизировать с API в фоне (но не блокируем создание)
      if (offlineStorage.getIsOnline()) {
        try {
          console.log('🔥 Attempting API sync...');
          console.log('🔥 Using userId:', userId);
          console.log('🔥 API request data:', { ...data, userId });
          const apiPage = await pagesApi.createPage({ ...data, userId });
          console.log('🔥 API sync successful:', apiPage);

          // Обновляем локальную страницу данными с сервера
          try {
            setPages(prev => prev.map(p => p.id === newPage.id ? { ...apiPage, id: newPage.id } : p));
            offlineStorage.savePage({ ...apiPage, id: newPage.id });
          } catch (syncError) {
            console.warn('🔥 Error updating page after API sync:', syncError);
          }
        } catch (apiError) {
          console.warn('🔥 API sync failed (but page created locally):', apiError);
          // Страница уже создана локально, это не ошибка
        }
      }

      return newPage;
    } catch (error) {
      console.error('🔥 CRITICAL ERROR in createPage:', error);

      // Создаем минимальную fallback страницу чтобы не сломать UI
      const fallbackPage: Page = {
        id: Date.now().toString(),
        title: 'Новая страница',
        description: '',
        slug: 'new-page-' + Date.now(),
        isPublished: false,
        blocks: [{
          id: '1',
          type: 'cards',
          title: 'Навигация',
          layout: 'vertical',
          cards: [],
          order: 0
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Пытаемся добавить fallback страницу
      try {
        setPages(prev => Array.isArray(prev) ? [...prev, fallbackPage] : [fallbackPage]);
        console.log('🔥 Fallback page created:', fallbackPage);
        return fallbackPage;
      } catch (fallbackError) {
        console.error('🔥 Even fallback failed:', fallbackError);
        return fallbackPage;
      }
    }
  };

  const updatePage = async (pageId: string, data: Partial<Page>): Promise<Page> => {
    console.log('🔥 usePages updatePage called with:', { pageId, data });

    try {
      const existingPage = pages.find(p => p.id === pageId);
      console.log('🔥 Found existing page:', existingPage);

      if (!existingPage) throw new Error('Page not found');

      const updatedPage = {
        ...existingPage,
        ...data,
        updatedAt: new Date().toISOString()
      };

      console.log('🔥 Prepared updated page:', updatedPage);
      console.log('🔥 Is online:', offlineStorage.getIsOnline());

      if (offlineStorage.getIsOnline()) {
        console.log('🔥 Calling API updatePage...');
        const apiUpdatedPage = await pagesApi.updatePage(pageId, data);
        console.log('🔥 API updatePage successful:', apiUpdatedPage);

        console.log('🔥 Updating pages state...');
        setPages(prev => prev.map(p => p.id === pageId ? apiUpdatedPage : p));

        console.log('🔥 Saving to offline storage...');
        offlineStorage.savePage(apiUpdatedPage);

        console.log('🔥 usePages updatePage completed (online)');
        return apiUpdatedPage;
      } else {
        console.log('🔥 Offline mode - updating local state only');
        setPages(prev => prev.map(p => p.id === pageId ? updatedPage : p));
        offlineStorage.savePage(updatedPage);
        console.log('🔥 usePages updatePage completed (offline)');
        return updatedPage;
      }
    } catch (err) {
      console.error('🔥 Error in usePages updatePage:', err);
      console.error('🔥 Error details:', err instanceof Error ? err.message : String(err));
      throw err;
    }
  };

  const createCard = async (pageId: string, blockId: string, cardData: CreateCardData): Promise<Card> => {
    console.log('🔥 usePages createCard called with:', { pageId, blockId, cardData });

    try {
      if (offlineStorage.getIsOnline()) {
        // Create card via API
        console.log('🔥 Creating card via API...');
        const newCard = await cardsApi.createCard(pageId, blockId, cardData);
        console.log('🔥 Card created via API:', newCard);

        // Update local page state
        setPages(prev => prev.map(page => {
          if (page.id === pageId) {
            return {
              ...page,
              blocks: page.blocks.map(block => {
                if (block.id === blockId) {
                  return {
                    ...block,
                    cards: [...block.cards, newCard]
                  };
                }
                return block;
              }),
              updatedAt: new Date().toISOString()
            };
          }
          return page;
        }));

        console.log('🔥 Local page state updated with new card');
        return newCard;
      } else {
        // Offline mode - create card locally
        console.log('🔥 Offline mode - creating card locally');
        const newCard: Card = {
          id: Date.now().toString(),
          title: cardData.title,
          description: cardData.description,
          iconName: cardData.iconName,
          iconUrl: cardData.iconUrl,
          url: cardData.url,
          type: cardData.type,
          order: 0 // Will be set by backend or calculated locally
        };

        // Update local state
        setPages(prev => prev.map(page => {
          if (page.id === pageId) {
            const updatedPage = {
              ...page,
              blocks: page.blocks.map(block => {
                if (block.id === blockId) {
                  return {
                    ...block,
                    cards: [...block.cards, { ...newCard, order: block.cards.length }]
                  };
                }
                return block;
              }),
              updatedAt: new Date().toISOString()
            };
            offlineStorage.savePage(updatedPage);
            return updatedPage;
          }
          return page;
        }));

        console.log('🔥 Card created locally:', newCard);
        return newCard;
      }
    } catch (error) {
      console.error('🔥 Error creating card:', error);
      throw error;
    }
  };

  const deletePage = async (pageId: string): Promise<void> => {
    try {
      if (offlineStorage.getIsOnline()) {
        await pagesApi.deletePage(pageId);
      }

      setPages(prev => prev.filter(p => p.id !== pageId));
      offlineStorage.deletePage(pageId);
    } catch (err) {
      console.error('Error deleting page:', err);
      throw err;
    }
  };

  const publishPage = async (pageId: string): Promise<Page> => {
    try {
      if (offlineStorage.getIsOnline()) {
        const publishedPage = await pagesApi.publishPage(pageId);
        setPages(prev => prev.map(p => p.id === pageId ? publishedPage : p));
        offlineStorage.savePage(publishedPage);
        return publishedPage;
      } else {
        const updatedPage = await updatePage(pageId, { isPublished: true });
        return updatedPage;
      }
    } catch (err) {
      console.error('Error publishing page:', err);
      throw err;
    }
  };

  const getPageById = (pageId: string): Page | undefined => {
    return pages.find(p => p.id === pageId);
  };

  const getPageBySlug = (slug: string): Page | undefined => {
    return pages.find(p => p.slug === slug);
  };

  return {
    pages,
    isLoading,
    error,
    createPage,
    updatePage,
    createCard,
    deletePage,
    publishPage,
    getPageById,
    getPageBySlug,
    refreshPages: loadPages,
    hasUnsyncedChanges: offlineStorage.hasUnsyncedChanges(),
    isOnline: offlineStorage.getIsOnline()
  };
};