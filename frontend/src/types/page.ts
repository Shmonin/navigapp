import { IconName } from './icons';

export type LayoutType = 'vertical' | 'grid' | 'horizontal' | 'feed';

export interface Card {
  id: string;
  title: string;
  description?: string;
  iconName?: IconName;
  iconUrl?: string;
  url?: string;
  type: 'link' | 'internal';
  order: number;
}

export interface PageBlock {
  id: string;
  type: 'cards';
  title?: string;
  description?: string;
  layout: LayoutType;
  cards: Card[];
  order: number;
}

export interface Page {
  id: string;
  title: string;
  description?: string;
  slug: string;
  isPublished: boolean;
  blocks: PageBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageData {
  title: string;
  description?: string;
}

export interface CreateCardData {
  title: string;
  description?: string;
  iconName?: IconName;
  iconUrl?: string;
  url?: string;
  type: 'link' | 'internal';
}