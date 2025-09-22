import React from 'react';
import { Page } from '@/types/page';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/utils/cn';

interface PagesListProps {
  pages: Page[];
  selectedPageId?: string;
  onPageSelect: (page: Page) => void;
  onPageEdit: (page: Page) => void;
  onPageDelete: (page: Page) => void;
  onPageAnalytics: (page: Page) => void;
  onCreatePage: () => void;
  canCreatePage: boolean;
  isProUser: boolean;
}

export const PagesList: React.FC<PagesListProps> = ({
  pages,
  selectedPageId,
  onPageSelect,
  onPageEdit,
  onPageDelete,
  onPageAnalytics,
  onCreatePage,
  canCreatePage,
  isProUser
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (page: Page) => {
    if (page.isPublished) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = (page: Page) => {
    if (page.isPublished) return 'TickCircle';
    return 'Clock';
  };

  return (
    <div className="bg-[var(--tg-theme-bg-color)] rounded-lg">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--tg-theme-section-separator-color)]">
        <h2 className="text-lg font-semibold text-[var(--tg-theme-text-color)]">
          Мои страницы ({pages.length})
        </h2>

        <Button
          variant="primary"
          size="sm"
          icon="Add"
          onClick={onCreatePage}
          disabled={!canCreatePage}
        >
          {canCreatePage ? 'Создать' : 'Лимит достигнут'}
        </Button>
      </div>

      {/* Список страниц */}
      <div className="divide-y divide-[var(--tg-theme-section-separator-color)]">
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Document" size="2xl" color="var(--tg-theme-hint-color)" className="mb-4" />
            <h3 className="text-lg font-semibold text-[var(--tg-theme-text-color)] mb-2">
              Нет страниц
            </h3>
            <p className="text-[var(--tg-theme-hint-color)] mb-4">
              Создайте свою первую страницу навигации
            </p>
            <Button
              variant="primary"
              icon="Add"
              onClick={onCreatePage}
              disabled={!canCreatePage}
            >
              Создать страницу
            </Button>
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page.id}
              className={cn(
                'p-4 cursor-pointer transition-colors hover:bg-[var(--tg-theme-secondary-bg-color)]',
                selectedPageId === page.id && 'bg-[var(--tg-theme-secondary-bg-color)]'
              )}
              onClick={() => onPageSelect(page)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Заголовок и статус */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-[var(--tg-theme-text-color)] truncate">
                      {page.title}
                    </h3>
                    <Icon
                      name={getStatusIcon(page)}
                      size="xs"
                      color={getStatusColor(page)}
                    />
                  </div>

                  {/* Описание */}
                  {page.description && (
                    <p className="text-sm text-[var(--tg-theme-hint-color)] mb-2 line-clamp-2">
                      {page.description}
                    </p>
                  )}

                  {/* Метаинформация */}
                  <div className="flex items-center gap-4 text-xs text-[var(--tg-theme-hint-color)]">
                    <span className="flex items-center gap-1">
                      <Icon name="Category" size="xs" />
                      {page.blocks[0]?.cards.length || 0} карточек
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Calendar" size="xs" />
                      {formatDate(page.updatedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="Eye" size="xs" />
                      {page.isPublished ? 'Опубликовано' : 'Черновик'}
                    </span>
                  </div>
                </div>

                {/* Действия */}
                <div className="flex items-center gap-1 ml-3">
                  {isProUser && page.isPublished && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Chart21"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPageAnalytics(page);
                      }}
                      className="p-2"
                    />
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Edit2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageEdit(page);
                    }}
                    className="p-2"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    icon="Trash"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPageDelete(page);
                    }}
                    className="p-2 text-red-500 hover:text-red-600"
                  />
                </div>
              </div>

              {/* Публичная ссылка */}
              {page.isPublished && (
                <div className="mt-3 pt-3 border-t border-[var(--tg-theme-section-separator-color)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--tg-theme-hint-color)]">
                      Публичная ссылка:
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Share"
                      onClick={(e) => {
                        e.stopPropagation();
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
                      className="p-1"
                    />
                  </div>
                  <p className="text-xs text-[var(--tg-theme-link-color)] truncate">
                    /p/{page.slug}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Ограничения для Free пользователей */}
      {!isProUser && pages.length > 0 && (
        <div className="p-4 border-t border-[var(--tg-theme-section-separator-color)] bg-[var(--tg-theme-secondary-bg-color)]">
          <div className="flex items-center gap-2 text-sm">
            <Icon name="InfoCircle" size="sm" color="var(--tg-theme-hint-color)" />
            <span className="text-[var(--tg-theme-hint-color)]">
              В бесплатной версии доступна 1 страница.{' '}
              <span className="text-[var(--tg-theme-link-color)]">
                Обновитесь до Pro
              </span>{' '}
              для создания неограниченного количества страниц.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};