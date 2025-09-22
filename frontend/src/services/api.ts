import { Page, Card, CreatePageData, CreateCardData } from '@/types/page';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-prisma-api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get auth token from localStorage or return demo token
function getAuthToken(): string {
  if (typeof window === 'undefined') return 'demo-token';
  return localStorage.getItem('auth_token') || 'demo-token';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authToken = getAuthToken();

  console.log('🌐 API Request:', {
    url,
    method: options.method || 'GET',
    authToken: authToken.substring(0, 20) + '...',
    body: options.body
  });

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🌐 API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });

    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }
    throw new ApiError(response.status, errorData.error?.message || errorData.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.success !== false ? data.data || data : data;
}

export const pagesApi = {
  async getPages(userId: string): Promise<Page[]> {
    return request<Page[]>(`/pages?userId=${userId}`);
  },

  async getPage(pageId: string): Promise<Page> {
    return request<Page>(`/pages/${pageId}`);
  },

  async getPageBySlug(slug: string): Promise<Page> {
    return request<Page>(`/public/page/${slug}`);
  },

  async createPage(data: CreatePageData & { userId: string }): Promise<Page> {
    return request<Page>('/pages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePage(pageId: string, data: Partial<Page>): Promise<Page> {
    return request<Page>(`/pages?id=${pageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePage(pageId: string): Promise<void> {
    return request<void>(`/pages?id=${pageId}`, {
      method: 'DELETE',
    });
  },

  async publishPage(pageId: string): Promise<Page> {
    return request<Page>(`/pages?id=${pageId}`, {
      method: 'PUT',
      body: JSON.stringify({ isPublished: true }),
    });
  },

  async unpublishPage(pageId: string): Promise<Page> {
    return request<Page>(`/pages?id=${pageId}`, {
      method: 'PUT',
      body: JSON.stringify({ isPublished: false }),
    });
  },
};

export const cardsApi = {
  async getCards(pageId: string, blockId: string): Promise<Card[]> {
    return request<Card[]>(`/pages/${pageId}/blocks/${blockId}/cards`);
  },

  async getCard(cardId: string): Promise<Card> {
    return request<Card>(`/cards/${cardId}`);
  },

  async createCard(pageId: string, blockId: string, data: CreateCardData): Promise<Card> {
    return request<Card>(`/pages/${pageId}/blocks/${blockId}/cards`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCard(cardId: string, data: Partial<Card>): Promise<Card> {
    return request<Card>(`/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCard(cardId: string): Promise<void> {
    return request<void>(`/cards/${cardId}`, {
      method: 'DELETE',
    });
  },

  async reorderCards(pageId: string, blockId: string, cardIds: string[]): Promise<Card[]> {
    return request<Card[]>(`/pages/${pageId}/blocks/${blockId}/cards/reorder`, {
      method: 'POST',
      body: JSON.stringify({ cardIds }),
    });
  },
};

export const analyticsApi = {
  async trackPageView(pageId: string, metadata?: Record<string, any>): Promise<void> {
    return request<void>('/analytics/page-view', {
      method: 'POST',
      body: JSON.stringify({
        pageId,
        timestamp: new Date().toISOString(),
        metadata,
      }),
    });
  },

  async trackCardClick(cardId: string, metadata?: Record<string, any>): Promise<void> {
    return request<void>('/analytics/card-click', {
      method: 'POST',
      body: JSON.stringify({
        cardId,
        timestamp: new Date().toISOString(),
        metadata,
      }),
    });
  },

  async getPageAnalytics(pageId: string, period: '7d' | '30d' | '90d' = '7d') {
    return request(`/analytics/pages/${pageId}?period=${period}`);
  },
};

// Auth API
export const authApi = {
  async authenticateWithTelegram(initData: string): Promise<{
    user: import('@/types/user').User;
    token: string;
    refreshToken: string;
  }> {
    // Remove auth header for this request
    const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      throw new ApiError(response.status, errorData.error?.message || errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Store token in localStorage
    if (data.success && data.data.token) {
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('refresh_token', data.data.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(data.data.user));
    }

    return data.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  },

  getCurrentUser(): import('@/types/user').User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};

export const userApi = {
  async getCurrentUser(): Promise<import('@/types/user').User> {
    const userData = authApi.getCurrentUser();
    if (!userData) {
      throw new ApiError(401, 'No user data found');
    }
    return userData;
  },

  async getUserStats(): Promise<import('@/types/user').UserStats> {
    const user = await this.getCurrentUser();
    const limits = await this.getUserLimits(user.id);
    return {
      pagesCount: limits.currentPageCount,
      cardsCount: limits.totalCards,
      totalViews: 0, // TODO: implement when analytics is connected
      totalClicks: 0, // TODO: implement when analytics is connected
      activePages: limits.currentPageCount // For now, assume all pages are active
    };
  },

  async getUserLimits(userId: string): Promise<{
    user: import('@/types/user').User;
    isPro: boolean;
    currentPageCount: number;
    totalCards: number;
    canCreatePage: boolean;
    canCreateCard: boolean;
    canUseAdvancedLayouts: boolean;
  }> {
    return request(`/user/limits?userId=${userId}`);
  },

  async updateUserPlan(plan: 'free' | 'pro'): Promise<void> {
    return request('/user/plan', {
      method: 'PUT',
      body: JSON.stringify({ plan }),
    });
  },

  async startTrial(): Promise<{ trialExpiresAt: string }> {
    return request('/user/trial', {
      method: 'POST',
    });
  },
};

export { ApiError };