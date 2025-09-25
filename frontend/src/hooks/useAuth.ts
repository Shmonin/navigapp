import { useState, useEffect, useCallback } from 'react';
import { authApi } from '@/services/api';
import { useTelegramWebApp } from './useTelegramWebApp';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = () => {
  const { webApp, isReady } = useTelegramWebApp();
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize state from localStorage immediately
    const existingUser = authApi.getCurrentUser();
    const existingToken = localStorage.getItem('auth_token');

    if (existingUser && existingToken) {
      return {
        user: existingUser,
        isLoading: false,
        isAuthenticated: true,
        error: null
      };
    }

    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
      error: null
    };
  });

  const authenticate = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('🔐 Starting authentication...');

      // Get initData from Telegram WebApp
      let initData = '';

      console.log('🔐 WebApp object:', webApp);
      console.log('🔐 WebApp initData:', webApp?.initData);
      console.log('🔐 WebApp initDataUnsafe:', webApp?.initDataUnsafe);

      if (webApp && webApp.initData) {
        initData = webApp.initData;
        console.log('🔐 Got initData from Telegram WebApp:', initData.substring(0, 50) + '...');
      } else {
        // Fallback for development or when Telegram is not available
        console.warn('🔐 Telegram WebApp not available, using demo mode');
        console.log('🔐 WebApp availability:', !!webApp);
        console.log('🔐 InitData availability:', !!webApp?.initData);
        initData = 'demo-init-data';
      }

      // Authenticate with backend
      console.log('🔐 Sending authentication request...');
      const authResult = await authApi.authenticateWithTelegram(initData);

      console.log('🔐 Authentication successful:', authResult.user);

      setAuthState({
        user: authResult.user,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });

    } catch (error) {
      console.error('🔐 Authentication failed:', error);

      // For demo/development, create a fallback user
      const fallbackUser: User = {
        id: 'demo-user',
        telegramId: '12345',
        firstName: 'Demo User',
        lastName: '',
        username: 'demo_user',
        subscriptionType: 'free',
        isDemo: true
      };

      // Save fallback user to localStorage
      localStorage.setItem('auth_token', 'demo-token');
      localStorage.setItem('user_data', JSON.stringify(fallbackUser));

      setAuthState({
        user: fallbackUser,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });

      console.log('🔐 Using fallback demo user for development');
    }
  }, [webApp]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });
      console.log('🔐 Logged out successfully');
    } catch (error) {
      console.error('🔐 Logout error:', error);
    }
  }, []);

  // Initialize authentication when Telegram WebApp is ready
  useEffect(() => {
    if (isReady && !authState.isAuthenticated) {
      // Only authenticate if not already authenticated
      authenticate();
    }
  }, [isReady, authenticate, authState.isAuthenticated]);

  return {
    ...authState,
    authenticate,
    logout,
    refresh: authenticate
  };
};