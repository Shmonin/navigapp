import { z } from 'zod';

export const analyticsViewSchema = z.object({
  pageId: z.string().uuid('Invalid page ID'),
  sessionId: z.string().min(1, 'Session ID is required'),
  referrer: z.string().optional(),
});

export const analyticsClickSchema = z.object({
  pageId: z.string().uuid('Invalid page ID'),
  cardId: z.string().uuid('Invalid card ID'),
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const analyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('week'),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type AnalyticsViewSchema = z.infer<typeof analyticsViewSchema>;
export type AnalyticsClickSchema = z.infer<typeof analyticsClickSchema>;
export type AnalyticsQuerySchema = z.infer<typeof analyticsQuerySchema>;