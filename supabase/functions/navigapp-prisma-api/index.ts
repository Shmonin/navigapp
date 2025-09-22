import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { db } from './database.ts';
import {
  validateTelegramWebAppData,
  isDemoMode,
  validateAuthToken,
  generateAuthToken,
  generateRefreshToken,
  type TelegramUser
} from './auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Health check with database connection test
    if (path.endsWith('/health')) {
      try {
        const isHealthy = await db.healthCheck();

        if (!isHealthy) {
          throw new Error('Database connection failed');
        }

        return new Response(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'navigapp-database-api',
            database: 'connected',
            dbType: 'postgresql',
            version: '2.0.0'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            status: 'error',
            timestamp: new Date().toISOString(),
            service: 'navigapp-database-api',
            database: 'disconnected',
            error: error.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Test CRUD operations endpoint
    if (path.endsWith('/test-crud')) {
      const auth = await validateAuthToken(req.headers.get('authorization'));
      if (!auth) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'GET') {
        // Test read operation
        const users = await db.getUsers(5);

        return new Response(
          JSON.stringify({
            success: true,
            operation: 'read',
            data: users,
            count: users.length
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'POST') {
        // Test create operation
        const body = await req.json();

        const testUser = await db.createUser({
          telegramId: Date.now() + Math.floor(Math.random() * 1000),
          firstName: body.firstName || 'Test User',
          subscriptionType: 'free'
        });

        return new Response(
          JSON.stringify({
            success: true,
            operation: 'create',
            data: testUser
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Users endpoint
    if (path.endsWith('/users')) {
      const auth = await validateAuthToken(req.headers.get('authorization'));
      if (!auth) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'GET') {
        const users = await db.getUsers();

        return new Response(
          JSON.stringify({
            success: true,
            data: users
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Pages endpoint with database operations
    if (path.endsWith('/pages')) {
      const auth = await validateAuthToken(req.headers.get('authorization'));
      if (!auth) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'GET') {
        const userId = url.searchParams.get('userId');
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'userId parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const pages = await db.getPagesByUserId(userId);

        return new Response(
          JSON.stringify({
            success: true,
            data: pages
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (req.method === 'POST') {
        const body = await req.json();

        // Check user limits before creating page
        const limits = await db.checkUserLimits(body.userId);
        if (!limits.canCreatePage) {
          return new Response(
            JSON.stringify({
              success: false,
              error: {
                message: 'Page limit reached. Upgrade to Pro for unlimited pages.',
                code: 'PAGE_LIMIT_REACHED',
                currentCount: limits.currentPageCount,
                maxAllowed: limits.isPro ? 'unlimited' : 1
              }
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const newPage = await db.createPage({
          userId: body.userId,
          title: body.title,
          description: body.description,
          slug: body.slug
        });

        return new Response(
          JSON.stringify({
            success: true,
            data: newPage
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // PUT method for updating pages
      if (req.method === 'PUT') {
        const pageId = url.searchParams.get('id');
        if (!pageId) {
          return new Response(
            JSON.stringify({ error: 'Page ID parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const body = await req.json();
        const updatedPage = await db.updatePage(pageId, body);

        return new Response(
          JSON.stringify({
            success: true,
            data: updatedPage
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // DELETE method for deleting pages
      if (req.method === 'DELETE') {
        const pageId = url.searchParams.get('id');
        if (!pageId) {
          return new Response(
            JSON.stringify({ error: 'Page ID parameter required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await db.deletePage(pageId);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Page deleted successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Telegram Authentication endpoint
    if (path.endsWith('/auth/telegram')) {
      if (req.method !== 'POST') {
        return new Response('Method not allowed', {
          status: 405,
          headers: corsHeaders
        });
      }

      try {
        const { initData } = await req.json();

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

        // Save or update user in database
        const user = userData.user;
        const telegramId = String(user.id);

        let dbUser = null;

        if (!isDemo) {
          // Check if user exists
          const existingUser = await db.getUserByTelegramId(telegramId);

          if (existingUser) {
            // Update existing user
            dbUser = await db.updateUser(existingUser.id, {
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
              lastActiveAt: new Date().toISOString()
            });
          } else {
            // Create new user
            dbUser = await db.createUser({
              telegramId: telegramId,
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
              subscriptionType: 'free'
            });
          }
        }

        // Generate tokens
        const userId = dbUser?.id || `user-${user.id}`;
        const authToken = generateAuthToken(userId);
        const refreshToken = generateRefreshToken(userId);

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
              token: authToken,
              refreshToken: refreshToken
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

    // Public page viewer endpoint
    if (path.includes('/public/') && path.includes('/page/')) {
      const slugMatch = path.match(/\/public\/page\/([^\/]+)/);
      if (!slugMatch) {
        return new Response(
          JSON.stringify({ error: 'Invalid page slug' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const slug = slugMatch[1];

      try {
        const pageData = await db.getPageBySlug(slug);

        // Track page view
        const sessionId = req.headers.get('x-session-id') || `session-${Date.now()}`;
        await db.trackEvent({
          pageId: pageData.id,
          eventType: 'view',
          sessionId: sessionId,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          referrer: req.headers.get('referer') || undefined
        });

        return new Response(
          JSON.stringify({
            success: true,
            data: pageData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            success: false,
            error: { message: 'Page not found', code: 'PAGE_NOT_FOUND' }
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // User limits check endpoint
    if (path.endsWith('/user/limits')) {
      const auth = await validateAuthToken(req.headers.get('authorization'));
      if (!auth) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userId = url.searchParams.get('userId');
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'userId parameter required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const limits = await db.checkUserLimits(userId);

      return new Response(
        JSON.stringify({
          success: true,
          data: limits
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Temporary endpoint to delete test user
    if (path.endsWith('/delete-test-user')) {
      const telegramId = '207873976';

      try {
        // Find user
        const user = await db.getUserByTelegramId(telegramId);

        if (!user) {
          return new Response(
            JSON.stringify({ message: `User with telegram_id ${telegramId} not found` }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete user's pages
        const pages = await db.getPagesByUserId(user.id);
        for (const page of pages) {
          await db.deletePage(page.id);
        }

        // Delete user
        await db.deleteUser(user.id);

        return new Response(
          JSON.stringify({
            success: true,
            message: `User ${telegramId} deleted successfully`,
            deletedUser: user
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Root endpoint
    if (path.endsWith('/navigapp-prisma-api') || path.endsWith('/navigapp-prisma-api/')) {
      return new Response(
        JSON.stringify({
          status: 'ok',
          message: 'Navigapp Database API is running',
          version: '1.0.0',
          database: 'supabase',
          dbType: 'postgresql',
          endpoints: {
            health: '/health',
            auth: '/auth/telegram',
            testCrud: '/test-crud',
            users: '/users',
            pages: '/pages',
            publicPage: '/public/page/{slug}',
            userLimits: '/user/limits'
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

  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message || 'Internal server error',
          code: 'INTERNAL_ERROR'
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});