export interface Subscription {
  id: string;
  userId: string;
  type: 'trial' | 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  tbankSubscriptionId?: string;
  amount: number; // в копейках
  currency: string;
  startedAt: string;
  expiresAt: string;
  autoRenewal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  tbankPaymentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paymentMethod?: string;
  errorMessage?: string;
  processedAt?: string;
  createdAt: string;
}

export interface SubscriptionStatus {
  type: 'free' | 'pro';
  status: 'active' | 'expired' | 'trial';
  expiresAt?: string;
  trialUsed: boolean;
  canStartTrial: boolean;
  nextPaymentDate?: string;
  autoRenewal: boolean;
}

export interface StartTrialRequest {
  returnUrl: string;
}

export interface SubscribeRequest {
  type: 'monthly' | 'yearly';
  returnUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  subscriptionId: string;
}