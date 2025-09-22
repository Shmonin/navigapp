import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePages } from '@/hooks/usePages';
import { useUser } from '@/hooks/useUser';
import { AnalyticsChart } from '@/components/Analytics/AnalyticsChart';
import { AnalyticsSummary } from '@/components/Analytics/AnalyticsSummary';
import { TopCardsAnalytics } from '@/components/Analytics/TopCardsAnalytics';
import { AnalyticsFilters } from '@/components/Analytics/AnalyticsFilters';
import { Button, Icon, LoadingSpinner, ErrorMessage } from '@/components/ui';
import { AnalyticsFilter } from '@/types/analytics';

export const PageAnalytics: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getPageById } = usePages(user?.id || '');

  const [showExportMenu, setShowExportMenu] = useState(false);

  const initialFilter: AnalyticsFilter = {
    period: '7d',
    pageId,
  };

  const {
    analytics,
    filter,
    isLoading,
    error,
    updateFilter,
    refreshAnalytics,
    exportData,
  } = useAnalytics(pageId || '', initialFilter);

  const page = pageId ? getPageById(pageId) : null;

  // Проверка доступа к аналитике
  const hasAnalyticsAccess = user?.subscriptionType === 'pro';

  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center p-4">
        <ErrorMessage
          title="Аналитика недоступна"
          message="Аналитика доступна только пользователям Pro плана"
          action={{
            label: 'Перейти к настройкам',
            onClick: () => navigate('/settings')
          }}
        />
      </div>
    );
  }

  if (!pageId || !page) {
    return (
      <div className="min-h-screen bg-[var(--tg-theme-secondary-bg-color)] flex items-center justify-center p-4">
        <ErrorMessage
          title="Страница не найдена"
          message="Запрашиваемая страница не существует"
          action={{
            label: 'Вернуться назад',
            onClick: () => navigate(-1)
          }}
        />
      </div>
    );
  }

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
          title="Ошибка загрузки"
          message={error}
          action={{
            label: 'Попробовать снова',
            onClick: refreshAnalytics
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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              icon="ArrowLeft"
              onClick={() => navigate(-1)}
            />
            <div>
              <h1 className="text-xl font-bold text-[var(--tg-theme-text-color)]">
                Аналитика
              </h1>
              <p className="text-sm text-[var(--tg-theme-hint-color)]">
                {page.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon="Refresh"
              onClick={refreshAnalytics}
            />

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                icon="DocumentDownload"
                onClick={() => setShowExportMenu(!showExportMenu)}
              />

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 bg-[var(--tg-theme-bg-color)] border border-[var(--tg-theme-section-separator-color)] rounded-lg shadow-lg z-10">
                  <div className="p-2 space-y-1">
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-secondary-bg-color)] rounded"
                      onClick={() => {
                        exportData('json');
                        setShowExportMenu(false);
                      }}
                    >
                      Экспорт JSON
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-[var(--tg-theme-text-color)] hover:bg-[var(--tg-theme-secondary-bg-color)] rounded"
                      onClick={() => {
                        exportData('csv');
                        setShowExportMenu(false);
                      }}
                    >
                      Экспорт CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <AnalyticsFilters
          filter={filter}
          onFilterChange={updateFilter}
        />

        {analytics ? (
          <>
            {/* Сводка */}
            <AnalyticsSummary summary={analytics.summary} />

            {/* Графики */}
            <div className="space-y-4">
              <AnalyticsChart
                data={analytics.views}
                title="Просмотры"
                color="#3B82F6"
                type="line"
              />

              <AnalyticsChart
                data={analytics.clicks}
                title="Клики"
                color="#10B981"
                type="bar"
              />
            </div>

            {/* Топ карточек */}
            <TopCardsAnalytics cards={analytics.topCards} />

            {/* Дополнительная информация */}
            <div className="bg-[var(--tg-theme-bg-color)] rounded-lg p-4">
              <h3 className="font-semibold text-[var(--tg-theme-text-color)] mb-3">
                Информация о странице
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--tg-theme-hint-color)]">Статус:</span>
                  <span className="text-[var(--tg-theme-text-color)]">
                    {page.isPublished ? 'Опубликована' : 'Черновик'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--tg-theme-hint-color)]">Карточек:</span>
                  <span className="text-[var(--tg-theme-text-color)]">
                    {page.blocks[0]?.cards.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--tg-theme-hint-color)]">Создана:</span>
                  <span className="text-[var(--tg-theme-text-color)]">
                    {new Date(page.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--tg-theme-hint-color)]">Обновлена:</span>
                  <span className="text-[var(--tg-theme-text-color)]">
                    {new Date(page.updatedAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Icon name="Chart21" size="2xl" color="var(--tg-theme-hint-color)" className="mb-4" />
            <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)] mb-2">
              Нет данных аналитики
            </h3>
            <p className="text-[var(--tg-theme-hint-color)]">
              Данные аналитики появятся после первых просмотров страницы
            </p>
          </div>
        )}
      </div>

      {/* Закрытие меню экспорта при клике вне его */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
};