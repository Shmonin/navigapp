import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { JWTService, type TokenPayload } from '../shared/jwt-service.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
};

interface RouteHandler {
  (req: Request, url: URL, jwtService: JWTService, supabase: any): Promise<Response>;
}

const routes: Record<string, RouteHandler> = {};

// Initialize services
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);
const jwtService = new JWTService();

// Health check endpoint
routes['health'] = async () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      version: 'v3.0.0',
      timestamp: new Date().toISOString(),
      service: 'navigapp-api-v3',
      features: ['bot-auth', 'public-pages', 'long-tokens']
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
};

// Bot Authentication - Initiate
routes['auth/bot/initiate'] = async (req: Request, url: URL, jwtService: JWTService, supabase: any) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { telegram_id, user_data } = await req.json();

    if (!telegram_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'telegram_id is required', code: 'VALIDATION_ERROR' }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate auth hash
    const authHash = jwtService.generateAuthHash();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save bot auth request
    const { data, error } = await supabase
      .from('bot_auth_requests')
      .insert({
        telegram_id: parseInt(telegram_id),
        auth_hash: authHash,
        user_data: user_data || null,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Failed to create auth request', code: 'DATABASE_ERROR' }
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate deep link for WebApp
    const deepLinkUrl = `https://navigapp.vercel.app/auth/bot?hash=${authHash}`;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          auth_hash: authHash,
          deep_link_url: deepLinkUrl,
          expires_at: expiresAt.toISOString(),
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Bot auth initiate error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Bot Authentication - Complete
routes['auth/bot/complete'] = async (req: Request, url: URL, jwtService: JWTService, supabase: any) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { auth_hash, telegram_user_data } = await req.json();

    if (!auth_hash) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'auth_hash is required', code: 'VALIDATION_ERROR' }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find bot auth request
    const { data: authRequest, error: findError } = await supabase
      .from('bot_auth_requests')
      .select('*')
      .eq('auth_hash', auth_hash)
      .eq('is_completed', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (findError || !authRequest) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Invalid or expired auth hash', code: 'AUTH_ERROR' }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find or create user
    let user;
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', authRequest.telegram_id)
      .single();

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          last_bot_auth_at: new Date().toISOString(),
          auth_preference: 'bot',
          last_active_at: new Date().toISOString(),
          ...(telegram_user_data?.first_name && { first_name: telegram_user_data.first_name }),
          ...(telegram_user_data?.username && { username: telegram_user_data.username }),
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }
      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          telegram_id: authRequest.telegram_id,
          first_name: telegram_user_data?.first_name,
          username: telegram_user_data?.username,
          last_bot_auth_at: new Date().toISOString(),
          auth_preference: 'bot',
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }
      user = newUser;
    }

    // Generate tokens
    const tokenPair = await jwtService.generateTokenPair(
      user.id,
      user.telegram_id.toString(),
      crypto.randomUUID(),
      'bot'
    );

    // Create auth session
    const { error: sessionError } = await supabase
      .from('auth_sessions')
      .insert({
        user_id: user.id,
        access_token: tokenPair.accessToken,
        refresh_token: tokenPair.refreshToken,
        bot_auth_hash: auth_hash,
        session_type: 'bot',
        expires_at: tokenPair.expiresAt.toISOString(),
        refresh_expires_at: tokenPair.refreshExpiresAt.toISOString(),
        ip_address: req.headers.get('x-forwarded-for'),
        user_agent: req.headers.get('user-agent'),
        device_fingerprint: jwtService.generateDeviceFingerprint(req),
      });

    if (sessionError) {
      throw sessionError;
    }

    // Mark auth request as completed
    await supabase
      .from('bot_auth_requests')
      .update({
        is_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('id', authRequest.id);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: user.id,
            telegram_id: user.telegram_id.toString(),
            first_name: user.first_name,
            username: user.username,
            subscription_type: user.subscription_type,
            auth_method: 'bot'
          },
          tokens: {
            access_token: tokenPair.accessToken,
            refresh_token: tokenPair.refreshToken,
            expires_at: tokenPair.expiresAt.toISOString(),
            refresh_expires_at: tokenPair.refreshExpiresAt.toISOString(),
          }
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Bot auth complete error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Public Pages Access
routes['public/pages'] = async (req: Request, url: URL) => {
  const pathSegments = url.pathname.split('/');
  const slug = pathSegments[pathSegments.length - 1];

  if (!slug) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Page slug is required', code: 'VALIDATION_ERROR' }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get public page by slug
    const { data: page, error } = await supabase
      .from('pages')
      .select(`
        id,
        title,
        description,
        slug,
        public_slug,
        meta_title,
        meta_description,
        og_image_url,
        is_published,
        view_count,
        created_at,
        updated_at,
        user:users!inner(
          id,
          first_name,
          username
        ),
        blocks:page_blocks(
          id,
          type,
          title,
          description,
          position,
          settings,
          cards:block_cards(
            id,
            title,
            description,
            icon_url,
            background_image_url,
            link_url,
            link_type,
            position
          )
        )
      `)
      .eq('public_slug', slug)
      .eq('is_public', true)
      .eq('is_published', true)
      .single();

    if (error || !page) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Page not found', code: 'NOT_FOUND' }
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Increment view count (fire and forget)
    supabase
      .from('pages')
      .update({ view_count: page.view_count + 1 })
      .eq('id', page.id)
      .then(() => {});

    // Sort blocks and cards by position
    page.blocks = page.blocks
      .sort((a: any, b: any) => a.position - b.position)
      .map((block: any) => ({
        ...block,
        cards: block.cards.sort((a: any, b: any) => a.position - b.position)
      }));

    return new Response(
      JSON.stringify({
        success: true,
        data: page
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      }
    );

  } catch (error) {
    console.error('Public page error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Token Refresh
routes['auth/refresh'] = async (req: Request, url: URL, jwtService: JWTService, supabase: any) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'refresh_token is required', code: 'VALIDATION_ERROR' }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate refresh token
    const payload = await jwtService.validateRefreshToken(refresh_token);
    if (!payload) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Invalid refresh token', code: 'AUTH_ERROR' }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find and validate session
    const { data: session, error: sessionError } = await supabase
      .from('auth_sessions')
      .select('*, user:users(*)')
      .eq('refresh_token', refresh_token)
      .eq('is_active', true)
      .gte('refresh_expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({
          success: false,
          error: { message: 'Invalid or expired session', code: 'AUTH_ERROR' }
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new token pair
    const newTokenPair = await jwtService.generateTokenPair(
      session.user.id,
      session.user.telegram_id.toString(),
      session.id,
      session.session_type
    );

    // Update session with new tokens
    const { error: updateError } = await supabase
      .from('auth_sessions')
      .update({
        access_token: newTokenPair.accessToken,
        refresh_token: newTokenPair.refreshToken,
        expires_at: newTokenPair.expiresAt.toISOString(),
        refresh_expires_at: newTokenPair.refreshExpiresAt.toISOString(),
        last_used_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          access_token: newTokenPair.accessToken,
          refresh_token: newTokenPair.refreshToken,
          expires_at: newTokenPair.expiresAt.toISOString(),
          refresh_expires_at: newTokenPair.refreshExpiresAt.toISOString(),
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Token refresh error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let path = url.pathname;

    // Remove function path prefix
    const prefixes = [
      '/functions/v1/navigapp-api-v3',
      '/navigapp-api-v3'
    ];

    for (const prefix of prefixes) {
      if (path.startsWith(prefix)) {
        path = path.substring(prefix.length);
        break;
      }
    }

    // Remove leading slash
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    // Handle public pages with dynamic routing
    if (path.startsWith('public/pages/')) {
      const handler = routes['public/pages'];
      if (handler) {
        return await handler(req, url, jwtService, supabase);
      }
    }

    // Find exact route match
    const handler = routes[path];
    if (handler) {
      return await handler(req, url, jwtService, supabase);
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: `Route not found: ${path}`,
          code: 'NOT_FOUND',
          availableRoutes: Object.keys(routes)
        }
      }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error handling request:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});