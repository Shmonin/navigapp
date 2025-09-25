import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface DebugInfo {
  app: {
    version: string;
    buildTime: string;
    environment: string;
    apiUrl: string;
  };
  telegram: {
    isAvailable: boolean;
    version: string;
    platform: string;
    colorScheme: string;
    initData: string;
    user: any;
  };
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    error: string | null;
  };
  api: {
    status: 'unknown' | 'connected' | 'error';
    lastCheck: string;
    response: any;
  };
  browser: {
    userAgent: string;
    viewport: string;
    localStorage: any;
  };
}

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { user, isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const { webApp, isReady: telegramReady } = useTelegramWebApp();

  const collectDebugInfo = async () => {
    setIsLoading(true);

    try {
      // Test API connectivity
      let apiStatus: DebugInfo['api'] = {
        status: 'unknown',
        lastCheck: new Date().toISOString(),
        response: null
      };

      try {
        const response = await fetch(import.meta.env.VITE_API_URL);
        const data = await response.json();
        apiStatus = {
          status: response.ok ? 'connected' : 'error',
          lastCheck: new Date().toISOString(),
          response: data
        };
      } catch (error) {
        apiStatus = {
          status: 'error',
          lastCheck: new Date().toISOString(),
          response: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }

      // Collect localStorage data
      const localStorageData: any = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          localStorageData[key] = localStorage.getItem(key);
        }
      }

      const info: DebugInfo = {
        app: {
          version: '1.0.0',
          buildTime: new Date().toISOString(),
          environment: import.meta.env.MODE,
          apiUrl: import.meta.env.VITE_API_URL
        },
        telegram: {
          isAvailable: !!webApp,
          version: webApp?.version || 'N/A',
          platform: webApp?.platform || 'unknown',
          colorScheme: webApp?.colorScheme || 'unknown',
          initData: webApp?.initData ? webApp.initData.substring(0, 50) + '...' : 'N/A',
          user: webApp?.initDataUnsafe?.user || null
        },
        auth: {
          isAuthenticated,
          isLoading: authLoading,
          user: user,
          error: authError
        },
        api: apiStatus,
        browser: {
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          localStorage: localStorageData
        }
      };

      setDebugInfo(info);
    } catch (error) {
      console.error('Failed to collect debug info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (debugInfo) {
      const text = JSON.stringify(debugInfo, null, 2);
      navigator.clipboard.writeText(text).then(() => {
        if (webApp?.HapticFeedback) {
          webApp.HapticFeedback.notificationOccurred('success');
        }
      });
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred('warning');
    }
    collectDebugInfo(); // Refresh info
  };

  useEffect(() => {
    if (isOpen && !debugInfo) {
      collectDebugInfo();
    }
  }, [isOpen]);

  return (
    <>
      {/* Debug Button - Fixed position */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
        style={{ zIndex: 9999 }}
      >
        <Icon name="SearchStatus" size="sm" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="🐛 Debug Panel"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Собираю информацию...</span>
            </div>
          ) : debugInfo ? (
            <>
              {/* App Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Icon name="Mobile" size="sm" className="mr-2" />
                  Приложение
                </h3>
                <div className="text-sm space-y-1">
                  <div><strong>Версия:</strong> {debugInfo.app.version}</div>
                  <div><strong>Окружение:</strong> {debugInfo.app.environment}</div>
                  <div><strong>API URL:</strong> <code className="bg-gray-200 px-1 rounded text-xs">{debugInfo.app.apiUrl}</code></div>
                </div>
              </div>

              {/* API Status */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Icon name="Global" size="sm" className="mr-2" />
                  API Статус
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    debugInfo.api.status === 'connected' ? 'bg-green-100 text-green-800' :
                    debugInfo.api.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {debugInfo.api.status === 'connected' ? 'Подключен' :
                     debugInfo.api.status === 'error' ? 'Ошибка' : 'Неизвестно'}
                  </span>
                </h3>
                <div className="text-sm">
                  <div><strong>Последняя проверка:</strong> {new Date(debugInfo.api.lastCheck).toLocaleTimeString()}</div>
                  {debugInfo.api.response && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600">Ответ API</summary>
                      <pre className="bg-gray-200 p-2 rounded text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(debugInfo.api.response, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              {/* Telegram Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Icon name="Send2" size="sm" className="mr-2" />
                  Telegram WebApp
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    debugInfo.telegram.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {debugInfo.telegram.isAvailable ? 'Доступен' : 'Недоступен'}
                  </span>
                </h3>
                <div className="text-sm space-y-1">
                  <div><strong>Версия:</strong> {debugInfo.telegram.version}</div>
                  <div><strong>Платформа:</strong> {debugInfo.telegram.platform}</div>
                  <div><strong>Тема:</strong> {debugInfo.telegram.colorScheme}</div>
                  <div><strong>InitData:</strong> <code className="bg-gray-200 px-1 rounded text-xs">{debugInfo.telegram.initData}</code></div>
                  {debugInfo.telegram.user && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600">Данные пользователя Telegram</summary>
                      <pre className="bg-gray-200 p-2 rounded text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(debugInfo.telegram.user, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              {/* Auth Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Icon name="Profile" size="sm" className="mr-2" />
                  Авторизация
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    debugInfo.auth.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {debugInfo.auth.isAuthenticated ? 'Авторизован' : 'Не авторизован'}
                  </span>
                </h3>
                <div className="text-sm space-y-1">
                  <div><strong>Загрузка:</strong> {debugInfo.auth.isLoading ? 'Да' : 'Нет'}</div>
                  {debugInfo.auth.error && (
                    <div><strong>Ошибка:</strong> <span className="text-red-600">{debugInfo.auth.error}</span></div>
                  )}
                  {debugInfo.auth.user && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600">Данные пользователя</summary>
                      <pre className="bg-gray-200 p-2 rounded text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(debugInfo.auth.user, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              {/* Browser Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Icon name="Monitor" size="sm" className="mr-2" />
                  Браузер
                </h3>
                <div className="text-sm space-y-1">
                  <div><strong>Viewport:</strong> {debugInfo.browser.viewport}</div>
                  <div><strong>User Agent:</strong>
                    <div className="bg-gray-200 p-1 rounded text-xs mt-1 break-all">
                      {debugInfo.browser.userAgent}
                    </div>
                  </div>
                  {Object.keys(debugInfo.browser.localStorage).length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-blue-600">LocalStorage</summary>
                      <pre className="bg-gray-200 p-2 rounded text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(debugInfo.browser.localStorage, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={collectDebugInfo}
                  disabled={isLoading}
                >
                  <Icon name="Refresh2" size="xs" className="mr-1" />
                  Обновить
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Icon name="Copy" size="xs" className="mr-1" />
                  Копировать
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={clearLocalStorage}
                >
                  <Icon name="Trash" size="xs" className="mr-1" />
                  Очистить кеш
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <Button onClick={collectDebugInfo}>
                Собрать информацию для отладки
              </Button>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};