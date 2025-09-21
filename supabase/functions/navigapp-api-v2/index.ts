import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Supabase client with hardcoded values (Edge Functions don't have access to custom env vars)
const supabaseUrl = 'https://zcvaxzakzkszoxienepi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjdmF4emFremtzem94aWVuZXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4Njg1NzMsImV4cCI6MjA0ODQ0NDU3M30.6uG5_PcOOW5UxqpGTlLjqgKAZuM9jJ0GJsHAcMH2YPU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

      // Import validation functions
      const { validateTelegramWebAppData, isDemoMode } = await import('./telegram-auth.ts');

      let userData = null;
      let isDemo = false;

      // Check if demo mode
      if (isDemoMode(initData)) {
        isDemo = true;
        userData = {
          user: {
            id: 12345,
            first_name: 'Demo User',
            username: 'demo_user'
          },
          auth_date: Math.floor(Date.now() / 1000)
        };
      } else {
        // Validate real Telegram data
        userData = validateTelegramWebAppData(initData);

        if (!userData || !userData.user) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                message: 'Invalid Telegram authentication data',
                code: 'INVALID_AUTH_DATA'
              }
            }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // Save user to database
      const user = userData.user;
      const telegramId = String(user.id);

      console.log('Authenticated user:', {
        id: user.id,
        first_name: user.first_name,
        username: user.username,
        isDemo: isDemo
      });

      let dbUser = null;

      // Try to save to database (don't fail if it doesn't work)
      if (!isDemo) {
        try {
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', telegramId)
            .maybeSingle();

          if (existingUser) {
            // Update existing user
            const { data: updatedUser } = await supabase
              .from('users')
              .update({
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                last_active: new Date().toISOString(),
              })
              .eq('telegram_id', telegramId)
              .select()
              .single();

            dbUser = updatedUser;
            console.log('Updated existing user:', updatedUser?.id);
          } else {
            // Create new user
            const { data: newUser } = await supabase
              .from('users')
              .insert({
                telegram_id: telegramId,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                subscription_type: 'free',
                created_at: new Date().toISOString(),
                last_active: new Date().toISOString(),
              })
              .select()
              .single();

            dbUser = newUser;
            console.log('Created new user:', newUser?.id);
          }
        } catch (error) {
          console.error('Database error (non-critical):', error);
          // Continue without database save
        }
      }

      // Use database user if available, otherwise use Telegram data
      const userId = dbUser?.id || `user-${user.id}`;

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            user: {
              id: userId,
              telegramId: telegramId,
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
              subscriptionType: dbUser?.subscription_type || 'free',
              isDemo: isDemo,
              savedToDb: !!dbUser
            },
            token: `jwt-${userId}-${Date.now()}`,
            refreshToken: `refresh-${userId}-${Date.now()}`
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (error) {
      console.error('Auth error:', error);
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