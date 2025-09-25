import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLink, Eye, User, Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

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

export const PublicPageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { initiateBotAuth } = useAuthContext();

  const [page, setPage] = useState<PublicPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Load public page
  useEffect(() => {
    if (!slug) {
      setError('Не указан адрес страницы');
      setLoading(false);
      return;
    }

    loadPublicPage(slug);
  }, [slug]);

  const loadPublicPage = async (pageSlug: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/public/pages/${pageSlug}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Страница не найдена');
        }
        throw new Error('Ошибка загрузки страницы');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Ошибка загрузки страницы');
      }

      setPage(result.data);

      // Update document title and meta tags
      if (result.data.meta_title) {
        document.title = result.data.meta_title;
      } else {
        document.title = `${result.data.title} | Навигапп`;
      }

      // Update meta description
      if (result.data.meta_description) {
        updateMetaTag('description', result.data.meta_description);
      }

      // Update Open Graph meta tags
      updateMetaTag('og:title', result.data.meta_title || result.data.title);
      updateMetaTag('og:description', result.data.meta_description || result.data.description || '');
      if (result.data.og_image_url) {
        updateMetaTag('og:image', result.data.og_image_url);
      }

    } catch (error) {
      console.error('Public page loading error:', error);
      setError(error instanceof Error ? error.message : 'Ошибка загрузки страницы');
    } finally {
      setLoading(false);
    }
  };

  const updateMetaTag = (name: string, content: string) => {
    let tag = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      if (name.startsWith('og:')) {
        tag.setAttribute('property', name);
      } else {
        tag.setAttribute('name', name);
      }
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  const handleCardClick = (card: PublicCard) => {
    if (card.link_type === 'external' && card.link_url) {
      window.open(card.link_url, '_blank', 'noopener,noreferrer');
    } else if (card.link_type === 'internal') {
      // Handle internal page navigation (if implemented)
      console.log('Internal navigation to:', card);
    }
  };

  const handleCreatePage = () => {
    initiateBotAuth();
  };

  const handleShare = async () => {
    if (navigator.share && page) {
      try {
        await navigator.share({
          title: page.title,
          text: page.description || `Посмотрите эту страницу: ${page.title}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  const renderCard = (card: PublicCard, blockType: string) => {
    const baseClasses = "block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-blue-200";

    if (blockType === 'vertical_list') {
      return (
        <div
          key={card.id}
          className={`${baseClasses} p-4`}
          onClick={() => handleCardClick(card)}
        >
          <div className="flex items-center space-x-3">
            {card.icon_url && (
              <img
                src={card.icon_url}
                alt=""
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {card.title}
              </h3>
              {card.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {card.description}
                </p>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      );
    }

    if (blockType === 'grid') {
      return (
        <div
          key={card.id}
          className={`${baseClasses} p-4 aspect-square`}
          onClick={() => handleCardClick(card)}
          style={{
            backgroundImage: card.background_image_url ? `url(${card.background_image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className={`h-full flex flex-col justify-end ${card.background_image_url ? 'bg-black bg-opacity-40 text-white rounded-lg p-3' : ''}`}>
            <h3 className="font-semibold text-sm line-clamp-2">
              {card.title}
            </h3>
            {card.description && (
              <p className="text-xs opacity-90 mt-1 line-clamp-2">
                {card.description}
              </p>
            )}
          </div>
        </div>
      );
    }

    // Default card style
    return (
      <div
        key={card.id}
        className={`${baseClasses} p-4`}
        onClick={() => handleCardClick(card)}
      >
        <h3 className="font-semibold text-gray-900 mb-1">
          {card.title}
        </h3>
        {card.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {card.description}
          </p>
        )}
      </div>
    );
  };

  const renderBlock = (block: PublicBlock) => {
    if (block.cards.length === 0) return null;

    const sortedCards = [...block.cards].sort((a, b) => a.position - b.position);

    let containerClass = "";
    if (block.type === 'grid') {
      containerClass = "grid grid-cols-2 gap-3";
    } else if (block.type === 'horizontal_scroll') {
      containerClass = "flex space-x-3 overflow-x-auto pb-2";
    } else {
      containerClass = "space-y-3";
    }

    return (
      <div key={block.id} className="mb-8">
        {(block.title || block.description) && (
          <div className="mb-4">
            {block.title && (
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {block.title}
              </h2>
            )}
            {block.description && (
              <p className="text-gray-600">
                {block.description}
              </p>
            )}
          </div>
        )}

        <div className={containerClass}>
          {sortedCards.map(card => renderCard(card, block.type))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загружаем страницу...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Страница не найдена
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'Запрошенная страница не существует или была удалена'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleCreatePage}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              🚀 Создать свою страницу
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sortedBlocks = [...page.blocks].sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="font-semibold text-gray-900">
                  {page.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{page.user.first_name || page.user.username || 'Аноним'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{page.view_count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Поделиться"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {page.description && (
          <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
            <p className="text-gray-700 leading-relaxed">
              {page.description}
            </p>
          </div>
        )}

        {sortedBlocks.length > 0 ? (
          sortedBlocks.map(block => renderBlock(block))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📄</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Страница пуста
            </h2>
            <p className="text-gray-600">
              Здесь пока нет содержимого
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-3">
              Страница создана в приложении
            </p>
            <button
              onClick={handleCreatePage}
              className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <span>🚀 Навигапп</span>
            </button>
            <p className="text-gray-400 text-xs mt-2">
              Создайте свою страницу навигации
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};