import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // Health check
  if (path.endsWith('/health')) {
    return new Response(
      JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'navigapp-api-v2'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Auth endpoint
  if (path.endsWith('/auth/telegram')) {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders
      });
    }

    try {
      const { initData } = await req.json();

      // TODO: Validate Telegram WebApp data
      // For now, return mock response for testing

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            user: {
              id: 'user-' + Date.now(),
              telegramId: '123456789',
              firstName: 'Test User',
              subscriptionType: 'free'
            },
            token: 'mock-jwt-' + Date.now(),
            refreshToken: 'mock-refresh-' + Date.now()
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: error.message || 'Invalid request',
            code: 'AUTH_ERROR'
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Pages endpoint
  if (path.endsWith('/pages')) {
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            pages: [],
            total: 0,
            hasMore: false
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        return new Response(
          JSON.stringify({
            success: true,
            data: {
              id: 'page-' + Date.now(),
              title: body.title || 'New Page',
              slug: 'page-' + Date.now(),
              isPublished: false,
              blocks: []
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: { message: 'Invalid request body' }
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }
  }

  // Root endpoint
  if (path.endsWith('/navigapp-api-v2') || path.endsWith('/navigapp-api-v2/')) {
    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'Navigapp API v2 is running',
        version: '2.0.0',
        endpoints: {
          health: '/health',
          auth: '/auth/telegram',
          pages: '/pages'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // 404
  return new Response(
    JSON.stringify({
      success: false,
      error: {
        message: 'Route not found',
        path: path
      }
    }),
    {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
});