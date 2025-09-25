import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export const BotAuthComplete: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeBotAuth, isLoading, isAuthenticated, error } = useAuthContext();

  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const authHash = searchParams.get('hash');
    const authType = searchParams.get('auth_type');

    if (!authHash || authType !== 'bot') {
      setAuthStatus('error');
      setErrorMessage('Неверные параметры авторизации');
      return;
    }

    // Complete bot authentication
    completeBotAuth(authHash)
      .then(() => {
        setAuthStatus('success');
        // Redirect to dashboard after successful auth
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      })
      .catch((error) => {
        console.error('Bot auth completion error:', error);
        setAuthStatus('error');
        setErrorMessage(error.message || 'Ошибка авторизации');
      });
  }, [searchParams, completeBotAuth, navigate]);

  // Handle auth state changes
  useEffect(() => {
    if (isAuthenticated && authStatus === 'loading') {
      setAuthStatus('success');
    }
    if (error && authStatus === 'loading') {
      setAuthStatus('error');
      setErrorMessage(error);
    }
  }, [isAuthenticated, error, authStatus]);

  if (authStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Завершаем авторизацию
            </h1>
            <p className="text-gray-600">
              Проверяем данные от Telegram бота...
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <span>Валидация токена авторизации</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <span>Создание пользовательской сессии</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span>Настройка приложения</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Авторизация успешна!
            </h1>
            <p className="text-gray-600">
              Добро пожаловать в Навигапп! Переносим вас в приложение...
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Сессия создана</span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Токен авторизации действует 90 дней
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>Переход в приложение</span>
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ошибка авторизации
            </h1>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'Произошла ошибка при завершении авторизации'}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">
              <strong>Что делать:</strong><br />
              1. Вернитесь в Telegram бот<br />
              2. Используйте команду /start заново<br />
              3. Попробуйте авторизацию ещё раз
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.href = 'https://t.me/navigapp_bot'}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              🤖 Перейти в бот
            </button>

            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};