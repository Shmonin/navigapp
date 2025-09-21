import { z } from 'zod';

export const blockTypeSchema = z.enum(['vertical_list', 'grid', 'horizontal_scroll', 'feed']);
export const linkTypeSchema = z.enum(['external', 'internal']);

export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  parentPageId: z.string().uuid().optional(),
});

export const updateCardSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Card title is required').max(255, 'Title is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  iconUrl: z.string().url('Invalid icon URL').optional(),
  backgroundImageUrl: z.string().url('Invalid background image URL').optional(),
  linkUrl: z.string().url('Invalid link URL').optional(),
  linkType: linkTypeSchema,
  internalPageId: z.string().uuid().optional(),
  position: z.number().int().min(0, 'Position must be non-negative'),
});

export const updateBlockSchema = z.object({
  id: z.string().uuid().optional(),
  type: blockTypeSchema,
  title: z.string().max(255, 'Block title is too long').optional(),
  description: z.string().max(500, 'Block description is too long').optional(),
  position: z.number().int().min(0, 'Position must be non-negative'),
  settings: z.record(z.any()).optional(),
  cards: z.array(updateCardSchema).max(50, 'Too many cards in block'),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  isPublished: z.boolean().optional(),
  blocks: z.array(updateBlockSchema).optional(),
});

export const pageQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
});

export type CreatePageSchema = z.infer<typeof createPageSchema>;
export type UpdatePageSchema = z.infer<typeof updatePageSchema>;
export type UpdateBlockSchema = z.infer<typeof updateBlockSchema>;
export type UpdateCardSchema = z.infer<typeof updateCardSchema>;
export type PageQuerySchema = z.infer<typeof pageQuerySchema>;