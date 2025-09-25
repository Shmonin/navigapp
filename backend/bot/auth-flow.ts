/**
 * Bot Authentication Flow Service
 *
 * Handles the complete flow:
 * 1. User clicks /start in bot
 * 2. Bot generates auth hash and deep link
 * 3. User opens WebApp via deep link
 * 4. WebApp completes auth and returns to bot
 */

interface BotAuthStep {
  telegram_id: bigint;
  auth_hash: string;
  deep_link_url: string;
  expires_at: Date;
}

interface AuthSession {
  user_id: string;
  access_token: string;
  refresh_token: string;
  session_type: 'bot' | 'webapp' | 'hybrid';
  expires_at: Date;
  refresh_expires_at: Date;
}

class BotAuthFlow {
  private readonly API_BASE_URL: string;
  private readonly WEBAPP_BASE_URL: string;

  constructor(apiBaseUrl: string, webappBaseUrl: string) {
    this.API_BASE_URL = apiBaseUrl;
    this.WEBAPP_BASE_URL = webappBaseUrl;
  }

  /**
   * Step 1: User clicks /start in bot
   * Generate auth hash and deep link for WebApp
   */
  async initiateAuth(telegramId: bigint, userData?: any): Promise<BotAuthStep> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/bot/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: telegramId.toString(),
          user_data: userData
        })
      });

      if (!response.ok) {
        throw new Error(`Auth initiation failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Auth initiation failed');
      }

      return {
        telegram_id: telegramId,
        auth_hash: result.data.auth_hash,
        deep_link_url: result.data.deep_link_url,
        expires_at: new Date(result.data.expires_at)
      };

    } catch (error) {
      console.error('Auth initiation error:', error);
      throw new Error('Failed to initiate bot authentication');
    }
  }

  /**
   * Step 2: Generate deep link for WebApp
   * This creates the URL that opens the WebApp with auth context
   */
  generateDeepLink(authHash: string, returnPath?: string): string {
    const params = new URLSearchParams({
      hash: authHash,
      auth_type: 'bot',
      ...(returnPath && { return_path: returnPath })
    });

    return `${this.WEBAPP_BASE_URL}/auth/bot?${params.toString()}`;
  }

  /**
   * Step 3: Process deep link in WebApp
   * Validate auth hash and prepare for completion
   */
  async processDeepLink(authHash: string): Promise<{ valid: boolean; telegram_id?: string; expires_at?: Date }> {
    try {
      // This would typically be called from the frontend
      // but we include it here for completeness of the flow

      const response = await fetch(`${this.API_BASE_URL}/auth/bot/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_hash: authHash
        })
      });

      if (!response.ok) {
        return { valid: false };
      }

      const result = await response.json();

      if (!result.success) {
        return { valid: false };
      }

      return {
        valid: true,
        telegram_id: result.data.telegram_id,
        expires_at: new Date(result.data.expires_at)
      };

    } catch (error) {
      console.error('Deep link processing error:', error);
      return { valid: false };
    }
  }

  /**
   * Step 4: Complete auth and get tokens
   * Called when WebApp completes authentication
   */
  async completeAuth(authHash: string, telegramUserData?: any): Promise<AuthSession> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/bot/complete`, {
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
        throw new Error(result.error?.message || 'Auth completion failed');
      }

      return {
        user_id: result.data.user.id,
        access_token: result.data.tokens.access_token,
        refresh_token: result.data.tokens.refresh_token,
        session_type: 'bot',
        expires_at: new Date(result.data.tokens.expires_at),
        refresh_expires_at: new Date(result.data.tokens.refresh_expires_at)
      };

    } catch (error) {
      console.error('Auth completion error:', error);
      throw new Error('Failed to complete bot authentication');
    }
  }

  /**
   * Utility: Check if auth hash is valid and not expired
   */
  async validateAuthHash(authHash: string): Promise<boolean> {
    const result = await this.processDeepLink(authHash);
    return result.valid;
  }

  /**
   * Utility: Generate WebApp URL with auth
   */
  generateWebAppUrl(authHash: string, path: string = '/'): string {
    const params = new URLSearchParams({
      hash: authHash,
      auth_type: 'bot'
    });

    const basePath = path.startsWith('/') ? path : `/${path}`;
    return `${this.WEBAPP_BASE_URL}${basePath}?${params.toString()}`;
  }

  /**
   * Handle auth timeout/expiry
   */
  async handleAuthTimeout(authHash: string): Promise<void> {
    try {
      // Clean up expired auth request
      await fetch(`${this.API_BASE_URL}/auth/bot/cleanup`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_hash: authHash
        })
      });
    } catch (error) {
      console.error('Auth cleanup error:', error);
    }
  }
}

/**
 * Bot Auth Flow Helper Functions
 */
export class BotAuthFlowHelpers {
  /**
   * Create inline keyboard for bot messages
   */
  static createAuthKeyboard(deepLinkUrl: string) {
    return {
      inline_keyboard: [
        [
          {
            text: '🚀 Открыть приложение',
            web_app: { url: deepLinkUrl }
          }
        ],
        [
          { text: '❓ Помощь', callback_data: 'help' },
          { text: '💎 Тарифы', callback_data: 'pricing' }
        ]
      ]
    };
  }

  /**
   * Format welcome message for new users
   */
  static getWelcomeMessage(isNewUser: boolean, userName?: string): string {
    if (isNewUser) {
      return `🚀 *Добро пожаловать в Навигапп!*

Создавайте красивые страницы навигации для ваших Telegram каналов и групп.

*Что умеет Навигапп:*
• 📄 Создание интерактивных страниц
• 🔗 Прямые ссылки без бота
• 📊 Аналитика просмотров
• 🎨 Красивые карточки с иконками

Нажмите кнопку ниже, чтобы начать! 👇`;
    }

    return `👋 С возвращением${userName ? `, ${userName}` : ''}!

Нажмите кнопку ниже, чтобы открыть ваше приложение:`;
  }

  /**
   * Get error message for auth failures
   */
  static getErrorMessage(errorCode: string): string {
    const messages: Record<string, string> = {
      'AUTH_EXPIRED': '⏰ Время авторизации истекло. Попробуйте ещё раз командой /start',
      'AUTH_INVALID': '❌ Неверная ссылка авторизации. Попробуйте ещё раз командой /start',
      'USER_BLOCKED': '🚫 Ваш аккаунт заблокирован. Обратитесь в поддержку @kirillshmonin',
      'SERVER_ERROR': '🔧 Технические неполадки. Попробуйте через несколько минут.',
      'NETWORK_ERROR': '🌐 Проблемы с сетью. Проверьте соединение и попробуйте ещё раз.'
    };

    return messages[errorCode] || '❌ Произошла ошибка. Попробуйте ещё раз командой /start';
  }
}

export { BotAuthFlow, type BotAuthStep, type AuthSession };