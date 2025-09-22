import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const telegramId = '207873976';

    console.log(`🗑️ Deleting user with telegram_id = ${telegramId}...`);

    // Find user
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId);

    if (findError) {
      throw findError;
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const user = users[0];

    // Delete user's pages
    const { error: pagesError } = await supabase
      .from('pages')
      .delete()
      .eq('user_id', user.id);

    if (pagesError) {
      console.error('Error deleting pages:', pagesError);
    }

    // Delete user
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      throw deleteError;
    }

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
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});