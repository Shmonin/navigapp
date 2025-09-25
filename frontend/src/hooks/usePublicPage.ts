import { useState, useEffect } from 'react';

interface PublicPage {
  id: string;
  title: string;
  description?: string;
  slug: string;
  public_slug: string;
  meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    first_name?: string;
    username?: string;
  };
  blocks: PublicBlock[];
}

interface PublicBlock {
  id: string;
  type: 'vertical_list' | 'grid' | 'horizontal_scroll' | 'feed';
  title?: string;
  description?: string;
  position: number;
  settings: any;
  cards: PublicCard[];
}

interface PublicCard {
  id: string;
  title: string;
  description?: string;
  icon_url?: string;
  background_image_url?: string;
  link_url?: string;
  link_type: 'external' | 'internal';
  position: number;
}

interface UsePublicPageState {
  page: PublicPage | null;
  isLoading: boolean;
  error: string | null;
}

export const usePublicPage = (slug: string) => {
  const [state, setState] = useState<UsePublicPageState>({
    page: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!slug) {
      setState({
        page: null,
        isLoading: false,
        error: 'Не указан адрес страницы'
      });
      return;
    }

    loadPublicPage(slug);
  }, [slug]);

  const loadPublicPage = async (pageSlug: string) => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }));

      // Use the v3 API for public pages
      const API_BASE = process.env.NODE_ENV === 'production'
        ? 'https://zcvaxzakzkszoxienepi.supabase.co/functions/v1/navigapp-api-v3'
        : '/api/v3';

      const response = await fetch(`${API_BASE}/public/pages/${pageSlug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Страница не найдена');
        }
        throw new Error(`Ошибка загрузки страницы: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Ошибка загрузки страницы');
      }

      const page = result.data;

      // Update document metadata
      updatePageMetadata(page);

      setState({
        page,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Public page loading error:', error);

      setState({
        page: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки страницы'
      });
    }
  };

  const updatePageMetadata = (page: PublicPage) => {
    // Update document title
    if (page.meta_title) {
      document.title = page.meta_title;
    } else {
      document.title = `${page.title} | Навигапп`;
    }

    // Update meta description
    updateMetaTag('description', page.meta_description || page.description || '');

    // Update Open Graph meta tags
    updateMetaTag('og:title', page.meta_title || page.title);
    updateMetaTag('og:description', page.meta_description || page.description || '');
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', window.location.href);

    if (page.og_image_url) {
      updateMetaTag('og:image', page.og_image_url);
    }

    // Update Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', page.meta_title || page.title);
    updateMetaTag('twitter:description', page.meta_description || page.description || '');

    if (page.og_image_url) {
      updateMetaTag('twitter:image', page.og_image_url);
    }

    // Update canonical URL
    updateLinkTag('canonical', window.location.href);
  };

  const updateMetaTag = (name: string, content: string) => {
    if (!content) return;

    let tag = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);

    if (!tag) {
      tag = document.createElement('meta');
      if (name.startsWith('og:') || name.startsWith('twitter:')) {
        tag.setAttribute('property', name);
      } else {
        tag.setAttribute('name', name);
      }
      document.head.appendChild(tag);
    }

    tag.setAttribute('content', content);
  };

  const updateLinkTag = (rel: string, href: string) => {
    let tag = document.querySelector(`link[rel="${rel}"]`);

    if (!tag) {
      tag = document.createElement('link');
      tag.setAttribute('rel', rel);
      document.head.appendChild(tag);
    }

    tag.setAttribute('href', href);
  };

  const refresh = () => {
    if (slug) {
      loadPublicPage(slug);
    }
  };

  return {
    ...state,
    refresh
  };
};

export type { PublicPage, PublicBlock, PublicCard };