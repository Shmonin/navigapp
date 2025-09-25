import { Context, Telegraf } from 'https://deno.land/x/grammy@v1.21.1/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface BotUser {
  id: number;
  first_name: string;
  username?: string;
  language_code?: string;
}

interface BotContext extends Context {
  from?: BotUser;
}

class NavigappBot {
  private bot: Telegraf<BotContext>;
  private supabase: any;
  private apiBaseUrl: string;

  constructor(botToken: string, supabaseUrl: string, supabaseKey: string) {
    this.bot = new Telegraf<BotContext>(botToken);
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.apiBaseUrl = 'https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v3';

    this.setupHandlers();
  }

  private setupHandlers() {
    // /start command handler
    this.bot.command('start', this.handleStart.bind(this));

    // /login command handler
    this.bot.command('login', this.handleLogin.bind(this));

    // /help command handler
    this.bot.command('help', this.handleHelp.bind(this));

    // Deep link handler for return from WebApp
    this.bot.on('web_app_data', this.handleWebAppData.bind(this));

    // Handle unknown commands
    this.bot.on('message', this.handleUnknownCommand.bind(this));
  }

  /**
   * Handle /start command - first-time registration
   */
  private async handleStart(ctx: BotContext) {
    if (!ctx.from) return;

    try {
      const telegramUser = ctx.from;
      const welcomeMessage = `🚀 *Добро пожаловать в Навигапп!*

Создавайте красивые страницы навигации для ваших Telegram каналов и групп.

*Что умеет Навигапп:*
• 📄 Создание интерактивных страниц навигации
• 🔗 Прямые ссылки на ваши страницы
• 📊 Аналитика просмотров и кликов
• 🎨 Красивые карточки с иконками

*Тарифы:*
• **Бесплатно**: 1 страница, до 8 карточек
• **Pro**: Неограниченные страницы и карточки + расширенная аналитика

Нажмите кнопку ниже, чтобы начать! 👇`;

      // Initiate bot auth process
      const authResponse = await this.initiateAuth(telegramUser);

      if (!authResponse.success) {
        await ctx.reply('❌ Произошла ошибка при авторизации. Попробуйте позже.');
        return;
      }

      // Send welcome message with WebApp button
      await ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть приложение',
                web_app: { url: authResponse.data.deep_link_url }
              }
            ],
            [
              { text: '❓ Помощь', callback_data: 'help' },
              { text: '💎 Тарифы', callback_data: 'pricing' }
            ]
          ]
        }
      });

    } catch (error) {
      console.error('Start command error:', error);
      await ctx.reply('❌ Произошла ошибка. Попробуйте ещё раз командой /start');
    }
  }

  /**
   * Handle /login command - for existing users
   */
  private async handleLogin(ctx: BotContext) {
    if (!ctx.from) return;

    try {
      const telegramUser = ctx.from;

      // Check if user exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id, first_name, subscription_type, total_pages_created')
        .eq('telegram_id', telegramUser.id)
        .single();

      let message = '';

      if (existingUser) {
        // Existing user
        message = `👋 С возвращением, ${existingUser.first_name || 'пользователь'}!

📊 *Ваша статистика:*
• Тариф: ${existingUser.subscription_type === 'pro' ? '💎 Pro' : '🆓 Бесплатный'}
• Создано страниц: ${existingUser.total_pages_created}

Нажмите кнопку ниже, чтобы открыть ваше приложение:`;
      } else {
        // New user
        message = `👋 Привет! Похоже, вы впервые используете Навигапп.

Нажмите кнопку ниже, чтобы начать создание вашей первой страницы навигации:`;
      }

      // Initiate auth process
      const authResponse = await this.initiateAuth(telegramUser);

      if (!authResponse.success) {
        await ctx.reply('❌ Произошла ошибка при авторизации. Попробуйте позже.');
        return;
      }

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть приложение',
                web_app: { url: authResponse.data.deep_link_url }
              }
            ]
          ]
        }
      });

    } catch (error) {
      console.error('Login command error:', error);
      await ctx.reply('❌ Произошла ошибка. Попробуйте ещё раз командой /login');
    }
  }

  /**
   * Handle /help command
   */
  private async handleHelp(ctx: BotContext) {
    const helpMessage = `❓ *Помощь по Навигапп*

*Основные команды:*
• /start - Начать работу с приложением
• /login - Войти в приложение
• /help - Показать эту справку

*Как использовать:*
1. Нажмите /start или /login
2. Откроется веб-приложение
3. Создайте свою первую страницу навигации
4. Поделитесь ссылкой в канале или группе

*Тарифы:*
• **Бесплатно**: 1 страница, до 8 карточек
• **Pro (299₽/мес)**: Неограниченные страницы, расширенная аналитика

*Поддержка:* @kirillshmonin

*Веб-версия:* https://navigapp.vercel.app`;

    await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
  }

  /**
   * Handle WebApp data return
   */
  private async handleWebAppData(ctx: BotContext) {
    if (!ctx.webAppData) return;

    try {
      const data = JSON.parse(ctx.webAppData.data);

      if (data.type === 'auth_completed') {
        await ctx.reply('✅ Авторизация завершена! Теперь вы можете создавать страницы навигации.');
      } else if (data.type === 'page_created') {
        await ctx.reply(`🎉 Поздравляем! Страница "${data.page_title}" создана!\n\n🔗 Прямая ссылка: ${data.page_url}`);
      }

    } catch (error) {
      console.error('WebApp data handling error:', error);
    }
  }

  /**
   * Handle unknown commands and messages
   */
  private async handleUnknownCommand(ctx: BotContext) {
    const message = `🤖 Я не понимаю эту команду.

*Доступные команды:*
• /start - Начать работу
• /login - Войти в приложение
• /help - Помощь

Или нажмите кнопку ниже, чтобы открыть приложение:`;

    if (ctx.from) {
      // Provide quick access to app
      const authResponse = await this.initiateAuth(ctx.from);

      await ctx.reply(message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🚀 Открыть приложение',
                web_app: { url: authResponse.data?.deep_link_url || 'https://navigapp.vercel.app' }
              }
            ]
          ]
        }
      });
    } else {
      await ctx.reply(message, { parse_mode: 'Markdown' });
    }
  }

  /**
   * Initiate bot authentication process
   */
  private async initiateAuth(telegramUser: BotUser) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/bot/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: telegramUser.id.toString(),
          user_data: {
            first_name: telegramUser.first_name,
            username: telegramUser.username,
            language_code: telegramUser.language_code,
          }
        })
      });

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Auth initiation error:', error);
      return {
        success: false,
        error: { message: 'Failed to initiate auth', code: 'API_ERROR' }
      };
    }
  }

  /**
   * Start the bot
   */
  public start() {
    console.log('🤖 Navigapp Bot starting...');
    this.bot.launch();

    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));

    console.log('✅ Navigapp Bot started successfully!');
  }

  /**
   * Stop the bot
   */
  public stop() {
    this.bot.stop();
    console.log('🛑 Navigapp Bot stopped.');
  }
}

// Export for use in different environments
export { NavigappBot };

// Auto-start if running as main script
if (import.meta.main) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!botToken || !supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- TELEGRAM_BOT_TOKEN');
    console.error('- SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    Deno.exit(1);
  }

  const bot = new NavigappBot(botToken, supabaseUrl, supabaseKey);
  bot.start();
}