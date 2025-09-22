export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

export interface Notification {
  id: string;
  type: 'subscription' | 'page' | 'system' | 'analytics';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  action?: {
    type: 'navigate' | 'external' | 'modal';
    target: string;
    label: string;
  };
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  subscriptionReminders: boolean;
  analyticsReports: boolean;
  systemUpdates: boolean;
}