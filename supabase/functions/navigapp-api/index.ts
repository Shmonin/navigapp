import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
};

interface RouteHandler {
  (req: Request, url: URL): Promise<Response>;
}

const routes: Record<string, RouteHandler> = {};

// Health check endpoint
routes['health'] = async () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'navigapp-api'
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
};

// Root endpoint
routes[''] = async () => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'Navigapp API is running',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/auth/telegram',
        pages: '/pages'
      }
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
};

// Auth routes
routes['auth/telegram'] = async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { initData } = await req.json();

    // TODO: Implement Telegram WebApp validation
    // For now, return a mock response
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: 'temp-user-id',
            telegramId: '123456789',
            firstName: 'Test User',
            subscriptionType: 'free'
          },
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token'
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
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Invalid request body',
          code: 'VALIDATION_ERROR'
        }
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
};

// Pages routes
routes['pages'] = async (req: Request) => {
  if (req.method === 'GET') {
    // TODO: Implement get pages
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          pages: [],
          total: 0,
          hasMore: false
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  if (req.method === 'POST') {
    // TODO: Implement create page
    try {
      const body = await req.json();

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            id: 'temp-page-id',
            title: body.title,
            slug: 'temp-slug',
            isPublished: false,
            blocks: []
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
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            message: 'Invalid request body',
            code: 'VALIDATION_ERROR'
          }
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
};

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Extract path and remove function name prefix
    let path = url.pathname;

    // Remove any variation of function path prefix
    const prefixes = [
      '/functions/v1/navigapp-api',
      '/navigapp-api'
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

    console.log('Original pathname:', url.pathname);
    console.log('Processed path:', path);

    // Find matching route
    const handler = routes[path];

    if (handler) {
      return await handler(req, url);
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