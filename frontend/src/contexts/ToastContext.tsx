import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '@/types/notifications';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toastData: Omit<Toast, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = {
      ...toastData,
      id,
      createdAt: Date.now(),
      duration: toastData.duration ?? 4000, // Shorter default for mobile
    };

    console.log('🔥 Toast: Adding toast:', toast);

    setToasts(prev => {
      // Limit to 3 toasts max for mobile performance
      const newToasts = [...prev, toast].slice(-3);
      console.log('🔥 Toast: Current toasts:', newToasts);
      return newToasts;
    });

    // Автоматическое удаление через указанное время
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        console.log('🔥 Toast: Auto-removing toast:', id);
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};