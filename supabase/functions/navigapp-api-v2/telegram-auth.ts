import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const BOT_TOKEN = '8180571940:AAG8TLcs6ILfmPRFTN9cK14rVl11_n1PSOI';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: any;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date: number;
  hash: string;
}

export function validateTelegramWebAppData(initData: string): TelegramInitData | null {
  try {
    // Parse URL-encoded data
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      console.error('No hash in init data');
      return null;
    }

    // Remove hash from params for validation
    params.delete('hash');

    // Sort params alphabetically and create data-check-string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Create secret key
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();

    // Calculate hash
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Validate hash
    if (calculatedHash !== hash) {
      console.error('Invalid hash', { calculated: calculatedHash, received: hash });
      return null;
    }

    // Check auth_date (data should be fresh - within 24 hours)
    const authDate = parseInt(params.get('auth_date') || '0');
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime - authDate > 86400) { // 24 hours
      console.error('Auth data is too old');
      return null;
    }

    // Parse user data
    const userData = params.get('user');
    const user = userData ? JSON.parse(userData) : null;

    return {
      query_id: params.get('query_id') || undefined,
      user,
      auth_date: authDate,
      hash,
      start_param: params.get('start_param') || undefined,
    };
  } catch (error) {
    console.error('Error validating Telegram data:', error);
    return null;
  }
}

// For development/testing - accept demo data
export function isDemoMode(initData: string): boolean {
  return initData === 'demo-init-data' || initData.startsWith('demo:');
}