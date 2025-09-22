import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom';
import { PublicPageViewer } from '@/components/PublicPage/PublicPageViewer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui';

// Lazy-loaded компоненты
const PageBuilder = lazy(() => import('@/pages/PageBuilder').then(module => ({ default: module.PageBuilder })));
const PageManager = lazy(() => import('@/pages/PageManager').then(module => ({ default: module.PageManager })));
const PageAnalytics = lazy(() => import('@/pages/PageAnalytics').then(module => ({ default: module.PageAnalytics })));
const UserSettings = lazy(() => import('@/pages/UserSettings').then(module => ({ default: module.UserSettings })));

// Компонент-обертка для публичных страниц
const PublicPageRoute: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--tg-theme-hint-color)]">
          Неверная ссылка на страницу
        </p>
      </div>
    );
  }

  return <PublicPageViewer slug={slug} />;
};

// Компонент-обертка с Suspense
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  }>
    {children}
  </Suspense>
);

// Главная страница приложения
const HomePage: React.FC = () => {
  return (
    <SuspenseWrapper>
      <PageBuilder />
    </SuspenseWrapper>
  );
};

// Страница 404
const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold text-[var(--tg-theme-text-color)] mb-2">
        404
      </h1>
      <p className="text-[var(--tg-theme-hint-color)] mb-4">
        Страница не найдена
      </p>
      <button
        className="text-[var(--tg-theme-link-color)] underline"
        onClick={() => window.location.href = '/'}
      >
        Вернуться на главную
      </button>
    </div>
  );
};

// Конфигурация роутера
export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/manager',
    element: (
      <SuspenseWrapper>
        <PageManager />
      </SuspenseWrapper>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/analytics/:pageId',
    element: (
      <SuspenseWrapper>
        <PageAnalytics />
      </SuspenseWrapper>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/settings',
    element: (
      <SuspenseWrapper>
        <UserSettings />
      </SuspenseWrapper>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/p/:slug',
    element: <PublicPageRoute />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

// Компонент роутера для экспорта
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};