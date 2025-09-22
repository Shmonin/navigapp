import React, { useEffect, useState } from 'react';
import { Page } from '@/types/page';
import { pagesApi, analyticsApi } from '@/services/api';
import { PublicCardList } from './PublicCardList';
import { PublicPageHeader } from './PublicPageHeader';
import { PublicPageFooter } from './PublicPageFooter';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { cn } from '@/utils/cn';

interface PublicPageViewerProps {
  slug: string;
}

export const PublicPageViewer: React.FC<PublicPageViewerProps> = ({ slug }) => {
  const [page, setPage] = useState<Page | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const pageData = await pagesApi.getPageBySlug(slug);

        if (!pageData.isPublished) {
          throw new Error('Страница не опубликована');
        }

        setPage(pageData);

        // Отслеживание просмотра страницы
        await analyticsApi.trackPageView(pageData.id, {
          source: 'public_view',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });

      } catch (err) {
        console.error('Error loading page:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки страницы');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadPage();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ErrorMessage
          title="Страница не найдена"
          message={error}
          action={{
            label: 'Обновить',
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <ErrorMessage
          title="Страница не найдена"
          message="Запрашиваемая страница не существует или была удалена"
        />
      </div>
    );
  }

  const mainBlock = page.blocks[0];

  return (
    <div className={cn(
      "min-h-screen bg-[var(--tg-theme-bg-color)]",
      "flex flex-col"
    )}>
      {/* Заголовок страницы */}
      <PublicPageHeader
        title={page.title}
        description={page.description}
      />

      {/* Основной контент */}
      <main className="flex-1 p-4">
        {mainBlock && mainBlock.cards.length > 0 ? (
          <PublicCardList
            cards={mainBlock.cards}
            layout={mainBlock.layout}
            title={mainBlock.title}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-[var(--tg-theme-hint-color)]">
              На этой странице пока нет карточек
            </p>
          </div>
        )}
      </main>

      {/* Подвал */}
      <PublicPageFooter />
    </div>
  );
};