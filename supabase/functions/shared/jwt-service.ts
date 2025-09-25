import { create, verify, decode, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

interface TokenPayload {
  sub: string; // user ID
  telegram_id: string;
  session_id: string;
  session_type: 'bot' | 'webapp' | 'hybrid';
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  refreshExpiresAt: Date;
}

class JWTService {
  private readonly SECRET_KEY: string;
  private readonly ACCESS_TOKEN_EXPIRES_IN = 15 * 60; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRES_IN = 90 * 24 * 60 * 60; // 90 days
  private readonly ISSUER = 'navigapp-api';
  private readonly AUDIENCE = 'navigapp-frontend';

  constructor() {
    this.SECRET_KEY = Deno.env.get('JWT_SECRET') || 'your-secret-key-change-in-production';
  }

  /**
   * Generate access and refresh token pair
   */
  async generateTokenPair(
    userId: string,
    telegramId: string,
    sessionId: string,
    sessionType: 'bot' | 'webapp' | 'hybrid'
  ): Promise<TokenPair> {
    const now = getNumericDate(new Date());
    const accessExp = now + this.ACCESS_TOKEN_EXPIRES_IN;
    const refreshExp = now + this.REFRESH_TOKEN_EXPIRES_IN;

    // Access token payload
    const accessPayload: TokenPayload = {
      sub: userId,
      telegram_id: telegramId,
      session_id: sessionId,
      session_type: sessionType,
      iat: now,
      exp: accessExp,
      iss: this.ISSUER,
      aud: this.AUDIENCE,
    };

    // Refresh token payload (similar but longer expiry)
    const refreshPayload: TokenPayload = {
      sub: userId,
      telegram_id: telegramId,
      session_id: sessionId,
      session_type: sessionType,
      iat: now,
      exp: refreshExp,
      iss: this.ISSUER,
      aud: this.AUDIENCE,
    };

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.SECRET_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const accessToken = await create(
      { alg: 'HS256', typ: 'JWT' },
      accessPayload,
      key
    );

    const refreshToken = await create(
      { alg: 'HS256', typ: 'JWT' },
      refreshPayload,
      key
    );

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(accessExp * 1000),
      refreshExpiresAt: new Date(refreshExp * 1000),
    };
  }

  /**
   * Validate access token
   */
  async validateAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(this.SECRET_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      );

      const payload = await verify(token, key) as TokenPayload;

      // Validate issuer and audience
      if (payload.iss !== this.ISSUER || payload.aud !== this.AUDIENCE) {
        return null;
      }

      return payload;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }

  /**
   * Validate refresh token
   */
  async validateRefreshToken(token: string): Promise<TokenPayload | null> {
    return this.validateAccessToken(token); // Same validation logic
  }

  /**
   * Decode token without validation (for debugging)
   */
  decodeToken(token: string): any {
    try {
      const [header, payload, signature] = decode(token);
      return { header, payload, signature };
    } catch (error) {
      console.error('Token decode error:', error);
      return null;
    }
  }

  /**
   * Generate auth hash for bot authentication
   */
  generateAuthHash(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}_${random}`;
  }

  /**
   * Generate device fingerprint from request
   */
  generateDeviceFingerprint(request: Request): string {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const xForwardedFor = request.headers.get('x-forwarded-for') || '';

    const fingerprint = `${userAgent}|${acceptLanguage}|${xForwardedFor}`;
    return btoa(fingerprint).substring(0, 32);
  }
}

export { JWTService, type TokenPayload, type TokenPair };