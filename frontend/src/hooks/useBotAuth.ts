import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/services/api';
import { useTelegramWebApp } from './useTelegramWebApp';
import type { User } from '@/types/user';
import type { AuthMethod } from '@/contexts/AuthContext';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPublicAccess: boolean;
  authMethod: AuthMethod;
  error: string | null;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  refresh_expires_at: string;
}

export const useBotAuth = () => {
  const { webApp, isReady } = useTelegramWebApp();

  const [authState, setAuthState] = useState<AuthState>(() => {
    // Check for existing authentication
    const existingToken = localStorage.getItem('access_token');
    const existingUser = localStorage.getItem('user_data');
    const authMethod = localStorage.getItem('auth_method') as AuthMethod;

    if (existingToken && existingUser) {
      try {
        return {
          user: JSON.parse(existingUser),
          isLoading: false,
          isAuthenticated: true,
          isPublicAccess: false,
          authMethod: authMethod || 'webapp',
          error: null
        };
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
      }
    }

    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isPublicAccess: window.location.pathname.startsWith('/p/'),
      authMethod: null,
      error: null
    };
  });

  /**
   * Store auth data in localStorage
   */
  const storeAuthData = useCallback((user: User, tokens: TokenPair, method: AuthMethod) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_at', tokens.expires_at);
    localStorage.setItem('refresh_expires_at', tokens.refresh_expires_at);
    localStorage.setItem('user_data', JSON.stringify(user));
    localStorage.setItem('auth_method', method || 'webapp');
  }, []);

  /**
   * Clear all auth data
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('refresh_expires_at');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_method');
  }, []);

  /**
   * Bot Authentication - Step 1: Initiate (redirect to bot)
   */
  const initiateBotAuth = useCallback(async () => {
    try {
      console.log('🤖 Initiating bot authentication...');

      // Check if we're in Telegram
      if (!webApp) {
        // Redirect to Telegram bot
        const botUsername = 'navigapp_bot'; // Replace with your bot username
        const startUrl = `https://t.me/${botUsername}?start=webapp`;
        window.open(startUrl, '_blank');
        return;
      }

      // If in Telegram, show message to use /start command
      webApp.showAlert('Используйте команду /start в боте для авторизации');

    } catch (error) {
      console.error('🤖 Bot auth initiation error:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Ошибка инициации bot авторизации'
      }));
    }
  }, [webApp]);

  /**
   * Bot Authentication - Step 2: Complete (called from WebApp with auth hash)
   */
  const completeBotAuth = useCallback(async (authHash: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('🤖 Completing bot authentication with hash:', authHash);

      // Get Telegram user data if available
      const telegramUserData = webApp?.initDataUnsafe?.user;

      const response = await fetch('/api/auth/bot/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_hash: authHash,
          telegram_user_data: telegramUserData
        })
      });

      if (!response.ok) {
        throw new Error(`Auth completion failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Bot authentication failed');
      }

      const { user, tokens } = result.data;

      // Store auth data
      storeAuthData(user, tokens, 'bot');

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        isPublicAccess: false,
        authMethod: 'bot',
        error: null
      });

      console.log('🤖 Bot authentication completed successfully');

      // Notify Telegram WebApp that auth is completed
      if (webApp) {
        webApp.sendData(JSON.stringify({
          type: 'auth_completed',
          method: 'bot',
          user_id: user.id
        }));
      }

    } catch (error) {
      console.error('🤖 Bot auth completion error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Ошибка завершения bot авторизации'
      }));
    }
  }, [webApp, storeAuthData]);

  /**
   * WebApp Authentication (fallback method)
   */
  const authenticateWebApp = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('📱 Starting WebApp authentication...');

      // Get initData from Telegram WebApp
      if (!webApp || !webApp.initData) {
        throw new Error('Приложение работает только в Telegram Mini App');
      }

      const initData = webApp.initData;
      console.log('📱 Got initData from Telegram WebApp');

      // Authenticate with backend (legacy endpoint)
      const authResult = await authApi.authenticateWithTelegram(initData);

      setAuthState({
        user: authResult.user,
        isLoading: false,
        isAuthenticated: true,
        isPublicAccess: false,
        authMethod: 'webapp',
        error: null
      });

      console.log('📱 WebApp authentication successful');

    } catch (error) {
      console.error('📱 WebApp authentication failed:', error);
      clearAuthData();

      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Ошибка WebApp авторизации'
      }));
    }
  }, [webApp, clearAuthData]);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing access token...');

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Token refresh failed');
      }

      const tokens = result.data;

      // Update stored tokens
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      localStorage.setItem('token_expires_at', tokens.expires_at);
      localStorage.setItem('refresh_expires_at', tokens.refresh_expires_at);

      console.log('🔄 Token refreshed successfully');

    } catch (error) {
      console.error('🔄 Token refresh error:', error);

      // If refresh fails, clear auth and redirect to login
      clearAuthData();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isPublicAccess: authState.isPublicAccess,
        authMethod: null,
        error: 'Сессия истекла. Требуется повторная авторизация'
      });
    }
  }, [clearAuthData, authState.isPublicAccess]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      // Call logout API
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        });
      }

      clearAuthData();

      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        isPublicAccess: authState.isPublicAccess,
        authMethod: null,
        error: null
      });

      console.log('👋 Logged out successfully');

    } catch (error) {
      console.error('👋 Logout error:', error);
      // Clear auth data anyway
      clearAuthData();
    }
  }, [clearAuthData, authState.isPublicAccess]);

  /**
   * Automatic token refresh
   */
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const tokenExpiresAt = localStorage.getItem('token_expires_at');
    if (!tokenExpiresAt) return;

    const expiresAt = new Date(tokenExpiresAt);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    // Refresh token 5 minutes before expiry
    const refreshThreshold = 5 * 60 * 1000; // 5 minutes

    if (timeUntilExpiry <= refreshThreshold) {
      refreshToken();
      return;
    }

    // Set up automatic refresh
    const timeout = setTimeout(() => {
      refreshToken();
    }, timeUntilExpiry - refreshThreshold);

    return () => clearTimeout(timeout);
  }, [authState.isAuthenticated, refreshToken]);

  /**
   * Handle URL parameters for bot auth completion
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authHash = urlParams.get('hash');
    const authType = urlParams.get('auth_type');

    if (authHash && authType === 'bot' && !authState.isAuthenticated) {
      completeBotAuth(authHash);

      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [authState.isAuthenticated, completeBotAuth]);

  return {
    ...authState,
    initiateBotAuth,
    completeBotAuth,
    authenticateWebApp,
    refreshToken,
    logout,

    // Legacy methods for backward compatibility
    authenticate: authenticateWebApp,
    refresh: refreshToken
  };
};