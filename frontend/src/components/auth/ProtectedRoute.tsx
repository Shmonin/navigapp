import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2, Shield } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  redirectTo = '/auth'
}) => {
  const { isAuthenticated, isLoading, user, initiateBotAuth } = useAuthContext();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Проверяем авторизацию...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the protected content
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // If not authenticated, show auth required screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Требуется авторизация
          </h1>
          <p className="text-gray-600">
            Для доступа к этому разделу необходимо войти в систему
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={initiateBotAuth}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>🤖</span>
            <span>Войти через Telegram бот</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">или</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = redirectTo}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Другие способы входа
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 <strong>Рекомендуем:</strong> Используйте Telegram бот для быстрого входа с долгоживущими токенами
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Higher-order component wrapper for protected routes
 */
export const withAuthRequired = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    redirectTo?: string;
  }
) => {
  return (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
};