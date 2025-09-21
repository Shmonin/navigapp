import { z } from 'zod';

export const startTrialSchema = z.object({
  returnUrl: z.string().url('Invalid return URL'),
});

export const subscribeSchema = z.object({
  type: z.enum(['monthly', 'yearly']),
  returnUrl: z.string().url('Invalid return URL'),
});

export type StartTrialSchema = z.infer<typeof startTrialSchema>;
export type SubscribeSchema = z.infer<typeof subscribeSchema>;