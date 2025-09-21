import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// Supabase client with service_role key for database access
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://zcvaxzakzkszoxienepi.supabase.co';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

      // Save to database (only for real users, not demo)
      if (!isDemo) {
        try {
          console.log('Attempting to save user to database:', {
            telegramId,
            firstName: user.first_name,
            username: user.username
          });

          // Check if user exists
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', telegramId)
            .maybeSingle();

          if (fetchError) {
            console.error('Error fetching existing user:', fetchError);
          }

          if (existingUser) {
            console.log('User exists, updating:', existingUser.id);

            // Update existing user
            const { data: updatedUser, error: updateError } = await supabase
              .from('users')
              .update({
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                last_active_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('telegram_id', telegramId)
              .select()
              .single();

            if (updateError) {
              console.error('Error updating user:', updateError);
            } else {
              dbUser = updatedUser;
              console.log('Successfully updated user:', updatedUser?.id);
            }
          } else {
            console.log('User does not exist, creating new user');

            // Create new user
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({
                telegram_id: telegramId,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                subscription_type: 'free',
                created_at: new Date().toISOString(),
                last_active_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (insertError) {
              console.error('Error creating user:', insertError);
              console.error('Insert error details:', {
                message: insertError.message,
                details: insertError.details,
                hint: insertError.hint,
                code: insertError.code
              });
            } else {
              dbUser = newUser;
              console.log('Successfully created user:', newUser?.id);
            }
          }
        } catch (error) {
          console.error('Database operation failed:', error);
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          });
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