/**
 * Validaciones del módulo Users
 *
 * Esquema Zod para formulario de usuario
 */

import { z } from 'zod';

/**
 * Esquema de validación para el formulario de usuario
 */
// Solo letras (incluye acentos y ñ), espacios, guión y apóstrofe
const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙ\s'-]+$/;

export const userSchema = z.object({
  isEditing: z.boolean().optional(),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(nameRegex, 'Solo se permiten letras y espacios'),
  email: z
    .string()
    .email('Email inválido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  password: z
    .string()
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  confirmPassword: z
    .string()
    .optional()
    .or(z.literal('')),
  roleIds: z
    .array(z.number())
    .min(1, 'Debe seleccionar al menos un rol')
    .optional(),
  active: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // Si no está editando, la contraseña es obligatoria
  if (!data.isEditing) {
    if (!data.password || data.password.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La contraseña es requerida',
        path: ['password'],
      });
    } else {
      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La contraseña debe tener al menos 8 caracteres',
          path: ['password'],
        });
      }
      if (!/[a-zA-Z]/.test(data.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La contraseña debe contener al menos una letra',
          path: ['password'],
        });
      }
      if (!/[0-9]/.test(data.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La contraseña debe contener al menos un número',
          path: ['password'],
        });
      }
    }
  } else {
    // Si está editando y puso contraseña, validar que cumpla reglas
    if (data.password && data.password.trim() !== '') {
      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La contraseña debe tener al menos 8 caracteres',
          path: ['password'],
        });
      }
      if (!/[a-zA-Z]/.test(data.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La contraseña debe contener al menos una letra',
          path: ['password'],
        });
      }
      if (!/[0-9]/.test(data.password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La contraseña debe contener al menos un número',
          path: ['password'],
        });
      }
    }
  }

  // Si hay contraseña, debe coincidir con confirmación
  if (data.password && data.password !== '') {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
      });
    }
  }
});

export type UserFormData = z.infer<typeof userSchema>;
