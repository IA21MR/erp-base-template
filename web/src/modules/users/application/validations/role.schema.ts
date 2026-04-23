/**
 * Validaciones del módulo Roles
 *
 * Esquema Zod para formulario de rol
 */

import { z } from 'zod';

// Solo letras (incluye acentos y ñ), espacios, guión
const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙ\s'-]+$/;

export const roleSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(nameRegex, 'Solo se permiten letras y espacios'),
  permissionIds: z
    .array(z.number())
    .min(1, 'Debe seleccionar al menos un permiso'),
});

export type RoleFormData = z.infer<typeof roleSchema>;
