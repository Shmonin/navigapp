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
    blocks?: Array<{
      id?: string;
      type: string;
      title?: string;
      layout?: string;
      order?: number;
      cards: Array<{
        id?: string;
        title: string;
        description?: string;
        iconName?: string;
        iconUrl?: string;
        url?: string;
        type: string;
        order: number;
      }>;
    }>;
  }) {
    // Update basic page data
    const updateData: any = {};

    if (pageData.title !== undefined) updateData.title = pageData.title;
    if (pageData.description !== undefined) updateData.description = pageData.description;
    if (pageData.isPublished !== undefined) updateData.is_published = pageData.isPublished;

    updateData.updated_at = new Date().toISOString();

    const { data: page, error } = await this.supabase
      .from('pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If blocks data is provided, update blocks and cards
    if (pageData.blocks && pageData.blocks.length > 0) {
      console.log('🔥 Updating blocks and cards for page:', id);

      for (const blockData of pageData.blocks) {
        console.log('🔥 Processing block:', blockData);

        // Map frontend block type to database type
        const mapBlockType = (frontendType: string, layout?: string) => {
          // If frontend sends 'cards' with layout, map to appropriate type
          if (frontendType === 'cards') {
            switch (layout) {
              case 'grid': return 'grid';
              case 'horizontal': return 'horizontal_scroll';
              case 'feed': return 'feed';
              default: return 'vertical_list';
            }
          }
          // Otherwise use the type as is (for direct API calls)
          return frontendType;
        };

        const dbBlockType = mapBlockType(blockData.type, blockData.layout);
        console.log('🔥 Mapped block type:', blockData.type, '->', dbBlockType);

        // Find or create the block
        let block;
        if (blockData.id && blockData.id !== '1') {
          // Try to find existing block by ID
          const { data: existingBlock, error: findError } = await this.supabase
            .from('page_blocks')
            .select('*')
            .eq('id', blockData.id)
            .eq('page_id', id)
            .maybeSingle();

          if (findError) {
            console.error('🔥 Error finding existing block:', findError);
          } else if (existingBlock) {
            // Update existing block
            const { data: updatedBlock, error: updateError } = await this.supabase
              .from('page_blocks')
              .update({
                type: dbBlockType,
                title: blockData.title,
                position: blockData.order || 0,
                settings: { layout: blockData.layout || 'vertical' },
                updated_at: new Date().toISOString()
              })
              .eq('id', blockData.id)
              .select()
              .single();

            if (updateError) {
              console.error('🔥 Error updating block:', updateError);
            } else {
              console.log('🔥 Block updated successfully:', updatedBlock);
              block = updatedBlock;
            }
          }
        }

        if (!block) {
          // Create new block or find the default block
          const { data: existingBlocks, error: listError } = await this.supabase
            .from('page_blocks')
            .select('*')
            .eq('page_id', id)
            .order('created_at', { ascending: true });

          if (listError) {
            console.error('🔥 Error getting existing blocks:', listError);
          }

          if (existingBlocks && existingBlocks.length > 0) {
            // Update the first existing block
            const { data: updatedBlock, error: updateError } = await this.supabase
              .from('page_blocks')
              .update({
                type: dbBlockType,
                title: blockData.title,
                position: blockData.order || 0,
                settings: { layout: blockData.layout || 'vertical' },
                updated_at: new Date().toISOString()
              })
              .eq('id', existingBlocks[0].id)
              .select()
              .single();

            if (updateError) {
              console.error('🔥 Error updating existing block:', updateError);
            } else {
              console.log('🔥 Existing block updated successfully:', updatedBlock);
              block = updatedBlock;
            }
          } else {
            // Create new block
            const { data: newBlock, error: createError } = await this.supabase
              .from('page_blocks')
              .insert({
                page_id: id,
                type: dbBlockType,
                title: blockData.title,
                position: blockData.order || 0,
                settings: { layout: blockData.layout || 'vertical' }
              })
              .select()
              .single();

            if (createError) {
              console.error('🔥 Error creating new block:', createError);
            } else {
              console.log('🔥 New block created successfully:', newBlock);
              block = newBlock;
            }
          }
        }

        if (block && blockData.cards) {
          console.log('🔥 Processing cards for block:', block.id);

          // Delete existing cards for this block
          const { error: deleteError } = await this.supabase
            .from('block_cards')
            .delete()
            .eq('block_id', block.id);

          if (deleteError) {
            console.error('🔥 Error deleting existing cards:', deleteError);
          } else {
            console.log('🔥 Existing cards deleted successfully');
          }

          // Insert new cards
          for (const cardData of blockData.cards) {
            console.log('🔥 Inserting card:', cardData);

            const { data: newCard, error: cardError } = await this.supabase
              .from('block_cards')
              .insert({
                block_id: block.id,
                title: cardData.title,
                description: cardData.description,
                icon_url: cardData.iconUrl,
                link_url: cardData.url,
                link_type: cardData.type || 'external',
                position: cardData.order || 0
              })
              .select()
              .single();

            if (cardError) {
              console.error('🔥 Error inserting card:', cardError);
            } else {
              console.log('🔥 Card inserted successfully:', newCard);
            }
          }
        } else {
          console.log('🔥 No block or no cards to process');
        }
      }

      console.log('🔥 Finished processing blocks and cards');
    } else {
      console.log('🔥 No blocks data provided to update');
    }

    // Return the updated page with blocks and cards
    return await this.getPageById(id);
  }

  async getPageById(id: string) {
    console.log('🔥 getPageById called with id:', id);

    const { data, error } = await this.supabase
      .from('pages')
      .select(`
        *,
        blocks:page_blocks(
          *,
          cards:block_cards(*)
        )
      `)
      .eq('id', id)
      .single();

    console.log('🔥 getPageById query result:', { data, error });

    if (error) throw error;

    // Double-check: query blocks separately to see if they exist
    const { data: blocksOnly, error: blocksError } = await this.supabase
      .from('page_blocks')
      .select('*')
      .eq('page_id', id);

    console.log('🔥 Blocks query result:', { blocksOnly, blocksError });

    if (blocksOnly && blocksOnly.length > 0) {
      // Also check cards for the first block
      const { data: cardsOnly, error: cardsError } = await this.supabase
        .from('block_cards')
        .select('*')
        .eq('block_id', blocksOnly[0].id);

      console.log('🔥 Cards query result:', { cardsOnly, cardsError });
    }

    console.log('🔥 getPageById returning data:', JSON.stringify(data, null, 2));
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