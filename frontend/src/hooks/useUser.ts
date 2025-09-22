import { useState, useEffect } from 'react';
import { User, UserStats } from '@/types/user';
import { userApi } from '@/services/api';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await userApi.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    if (!user) return;

    try {
      const stats = await userApi.getUserStats();
      setUserStats(stats);
    } catch (err) {
      console.error('Error loading user stats:', err);
    }
  };

  const updateUserPlan = async (plan: 'free' | 'pro') => {
    try {
      await userApi.updateUserPlan(plan);

      if (user) {
        setUser({
          ...user,
          subscriptionType: plan,
          updatedAt: new Date().toISOString()
        });
      }

      await loadUserStats();
    } catch (err) {
      console.error('Error updating user plan:', err);
      throw err;
    }
  };

  const startTrial = async () => {
    try {
      const trialData = await userApi.startTrial();

      if (user) {
        setUser({
          ...user,
          subscriptionType: 'pro',
          subscriptionStatus: 'trial',
          trialExpiresAt: trialData.trialExpiresAt,
          updatedAt: new Date().toISOString()
        });
      }

      return trialData;
    } catch (err) {
      console.error('Error starting trial:', err);
      throw err;
    }
  };

  const isTrialActive = () => {
    if (!user || !user.trialExpiresAt) return false;
    return new Date(user.trialExpiresAt) > new Date();
  };

  const isSubscriptionActive = () => {
    return user?.subscriptionStatus === 'active' || isTrialActive();
  };

  const getTrialDaysLeft = () => {
    if (!user || !user.trialExpiresAt) return 0;
    const now = new Date();
    const trialEnd = new Date(user.trialExpiresAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getSubscriptionDaysLeft = () => {
    if (!user || !user.subscriptionExpiresAt) return 0;
    const now = new Date();
    const subEnd = new Date(user.subscriptionExpiresAt);
    const diffTime = subEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  return {
    user,
    userStats,
    isLoading,
    error,
    updateUserPlan,
    startTrial,
    isTrialActive: isTrialActive(),
    isSubscriptionActive: isSubscriptionActive(),
    trialDaysLeft: getTrialDaysLeft(),
    subscriptionDaysLeft: getSubscriptionDaysLeft(),
    refreshUser: loadUser,
    refreshStats: loadUserStats,
  };
};