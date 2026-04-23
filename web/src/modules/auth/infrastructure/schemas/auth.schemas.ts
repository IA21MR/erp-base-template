import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════

/** Respuesta de login/refresh (snake_case del backend) */
export const AuthTokensRawSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.string(),
});

export const UserProfileSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  active: z.boolean(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

export const ForgotPasswordSchema = z.object({
  message: z.string(),
});

export const VerifyResetCodeSchema = z.object({
  valid: z.boolean(),
  message: z.string().optional(),
});

export const ResetPasswordSchema = z.object({
  message: z.string(),
});
