import React, { createContext, useContext } from 'react';
import { useBotAuth } from '@/hooks/useBotAuth';
import type { User } from '@/types/user';

export type AuthMethod = 'bot' | 'webapp' | 'public' | null;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPublicAccess: boolean;
  authMethod: AuthMethod;
  error: string | null;

  // Bot auth methods
  initiateBotAuth: () => Promise<void>;
  completeBotAuth: (authHash: string) => Promise<void>;

  // WebApp auth methods (fallback)
  authenticateWebApp: () => Promise<void>;

  // Token management
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;

  // Legacy methods for backward compatibility
  authenticate: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useBotAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};