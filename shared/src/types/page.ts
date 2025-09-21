import { BlockType } from './user.js';

export interface Page {
  id: string;
  userId: string;
  title: string;
  description?: string;
  slug: string;
  isPublished: boolean;
  parentPageId?: string;
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  blocks: PageBlock[];
  owner?: {
    id: string;
    firstName?: string;
    username?: string;
  };
}

export interface PageBlock {
  id: string;
  pageId: string;
  type: BlockType;
  title?: string;
  description?: string;
  position: number;
  settings: Record<string, any>;
  cards: BlockCard[];
}

export interface BlockCard {
  id: string;
  blockId: string;
  title: string;
  description?: string;
  iconUrl?: string;
  backgroundImageUrl?: string;
  linkUrl?: string;
  linkType: 'external' | 'internal';
  internalPageId?: string;
  position: number;
  clickCount: number;
}

export interface CreatePageRequest {
  title: string;
  description?: string;
  parentPageId?: string;
}

export interface UpdatePageRequest {
  title?: string;
  description?: string;
  isPublished?: boolean;
  blocks?: UpdateBlockRequest[];
}

export interface UpdateBlockRequest {
  id?: string; // If exists - update, if not - create
  type: BlockType;
  title?: string;
  description?: string;
  position: number;
  settings?: Record<string, any>;
  cards: UpdateCardRequest[];
}

export interface UpdateCardRequest {
  id?: string;
  title: string;
  description?: string;
  iconUrl?: string;
  backgroundImageUrl?: string;
  linkUrl?: string;
  linkType: 'external' | 'internal';
  internalPageId?: string;
  position: number;
}

export interface PagesListResponse {
  pages: {
    id: string;
    title: string;
    description?: string;
    slug: string;
    isPublished: boolean;
    viewCount: number;
    clickCount: number;
    createdAt: string;
    updatedAt: string;
    blocksCount: number;
    cardsCount: number;
  }[];
  total: number;
  hasMore: boolean;
}