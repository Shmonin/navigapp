import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Database connection helper
export class DatabaseClient {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://zcvaxzakzkszoxienepi.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  // User operations
  async getUsers(limit: number = 50) {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        id,
        telegram_id,
        first_name,
        last_name,
        username,
        subscription_type,
        subscription_expires_at,
        trial_used,
        total_pages_created,
        last_active_at,
        created_at
      `)
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getUserById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        id,
        telegram_id,
        first_name,
        last_name,
        username,
        subscription_type,
        subscription_expires_at,
        trial_used,
        total_pages_created,
        last_active_at,
        created_at
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByTelegramId(telegramId: string | number) {
    const { data, error } = await this.supabase
      .from('users')
      .select(`
        id,
        telegram_id,
        first_name,
        last_name,
        username,
        subscription_type,
        subscription_expires_at,
        trial_used,
        total_pages_created,
        last_active_at,
        created_at
      `)
      .eq('telegram_id', telegramId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createUser(userData: {
    telegramId: string | number;
    firstName?: string;
    lastName?: string;
    username?: string;
    subscriptionType?: string;
  }) {
    const { data, error } = await this.supabase
      .from('users')
      .insert({
        telegram_id: userData.telegramId,
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: userData.username,
        subscription_type: userData.subscriptionType || 'free'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, userData: {
    firstName?: string;
    lastName?: string;
    username?: string;
    subscriptionType?: string;
    lastActiveAt?: string;
  }) {
    const updateData: any = {};

    if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
    if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
    if (userData.username !== undefined) updateData.username = userData.username;
    if (userData.subscriptionType !== undefined) updateData.subscription_type = userData.subscriptionType;
    if (userData.lastActiveAt !== undefined) updateData.last_active_at = userData.lastActiveAt;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Page operations
  async getPagesByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('pages')
      .select(`
        *,
        blocks:page_blocks(
          *,
          cards:block_cards(*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getPageBySlug(slug: string) {
    console.log('Searching for page with slug:', slug);

    // First try simple query
    const { data, error } = await this.supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error) {
      console.error('Error finding page:', error);
      throw error;
    }

    console.log('Found page:', data);

    // If we found the page, get blocks and cards separately
    if (data) {
      const { data: blocks, error: blocksError } = await this.supabase
        .from('page_blocks')
        .select(`
          *,
          cards:block_cards(*)
        `)
        .eq('page_id', data.id);

      if (blocksError) {
        console.error('Error getting blocks:', blocksError);
      } else {
        data.blocks = blocks || [];
        console.log('Added blocks to page:', blocks?.length || 0);
      }
    }

    return data;
  }

  async createPage(pageData: {
    userId: string;
    title: string;
    description?: string;
    slug?: string;
  }) {
    const slug = pageData.slug || `page-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const { data, error } = await this.supabase
      .from('pages')
      .insert({
        user_id: pageData.userId,
        title: pageData.title,
        description: pageData.description,
        slug: slug,
        is_published: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePage(id: string, pageData: {
    title?: string;
    description?: string;
    isPublished?: boolean;
  }) {
    const updateData: any = {};

    if (pageData.title !== undefined) updateData.title = pageData.title;
    if (pageData.description !== undefined) updateData.description = pageData.description;
    if (pageData.isPublished !== undefined) updateData.is_published = pageData.isPublished;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePage(id: string) {
    const { error } = await this.supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  async deleteUser(id: string) {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }

  // Block operations
  async createBlock(blockData: {
    pageId: string;
    type: string;
    title?: string;
    description?: string;
    position: number;
    settings?: any;
  }) {
    const { data, error } = await this.supabase
      .from('page_blocks')
      .insert({
        page_id: blockData.pageId,
        type: blockData.type,
        title: blockData.title,
        description: blockData.description,
        position: blockData.position,
        settings: blockData.settings || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Card operations
  async createCard(cardData: {
    blockId: string;
    title: string;
    description?: string;
    iconUrl?: string;
    backgroundImageUrl?: string;
    linkUrl?: string;
    linkType?: string;
    internalPageId?: string;
    position: number;
  }) {
    const { data, error } = await this.supabase
      .from('block_cards')
      .insert({
        block_id: cardData.blockId,
        title: cardData.title,
        description: cardData.description,
        icon_url: cardData.iconUrl,
        background_image_url: cardData.backgroundImageUrl,
        link_url: cardData.linkUrl,
        link_type: cardData.linkType || 'external',
        internal_page_id: cardData.internalPageId,
        position: cardData.position
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics operations
  async trackEvent(eventData: {
    pageId: string;
    eventType: string;
    cardId?: string;
    userTelegramId?: string;
    sessionId: string;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  }) {
    const { data, error } = await this.supabase
      .from('analytics_events')
      .insert({
        page_id: eventData.pageId,
        event_type: eventData.eventType,
        card_id: eventData.cardId,
        user_telegram_id: eventData.userTelegramId,
        session_id: eventData.sessionId,
        ip_address: eventData.ipAddress,
        user_agent: eventData.userAgent,
        referrer: eventData.referrer
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPageAnalytics(pageId: string, startDate?: string, endDate?: string) {
    let query = this.supabase
      .from('analytics_events')
      .select('*')
      .eq('page_id', pageId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Subscription operations
  async checkUserLimits(userId: string) {
    const user = await this.getUserById(userId);
    const pages = await this.getPagesByUserId(userId);

    const isPro = user.subscription_type !== 'free';
    const currentPageCount = pages.length;

    // Calculate total cards across all pages
    const totalCards = pages.reduce((total, page) => {
      return total + (page.blocks || []).reduce((blockTotal: number, block: any) => {
        return blockTotal + (block.cards || []).length;
      }, 0);
    }, 0);

    return {
      user,
      isPro,
      currentPageCount,
      totalCards,
      canCreatePage: isPro || currentPageCount < 1,
      canCreateCard: isPro || totalCards < 8,
      canUseAdvancedLayouts: isPro
    };
  }
}

// Export singleton instance
export const db = new DatabaseClient();