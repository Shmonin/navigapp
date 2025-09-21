import { z } from 'zod';

export const telegramAuthSchema = z.object({
  initData: z.string().min(1, 'Init data is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(255).optional(),
  username: z.string().min(1).max(255).optional(),
});

export type TelegramAuthSchema = z.infer<typeof telegramAuthSchema>;
export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;