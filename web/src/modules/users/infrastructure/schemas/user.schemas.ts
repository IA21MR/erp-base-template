import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// USUARIOS
// ═══════════════════════════════════════════════════════════════

const RoleSimpleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const UserApiResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  active: z.boolean(),
  roles: z.array(RoleSimpleSchema).optional(),
});

export const UserSearchResponseSchema = z.object({
  data: z.array(UserApiResponseSchema),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number(),
  }),
});

// ═══════════════════════════════════════════════════════════════
// ROLES Y PERMISOS
// ═══════════════════════════════════════════════════════════════

export const PermissionSchema = z.object({
  id: z.number(),
  code: z.string(),
  description: z.string().nullable(),
});

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  permissions: z.array(PermissionSchema),
});

export const RoleCreatedSchema = z.object({
  id: z.number(),
  name: z.string(),
  permissionIds: z.array(z.number()),
});
