import { z } from 'zod';

/**
 * Schema genérico para el wrapper estándar de respuestas del backend: { message, data }
 * Usado por la mayoría de los endpoints de la API.
 */
export function apiWrapperSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    message: z.string(),
    data: dataSchema,
  });
}

/**
 * Schema genérico para respuestas paginadas con meta separado.
 * Usado por endpoints que retornan { items, meta: { total, page, ... } }
 */
export function paginatedMetaSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      perPage: z.number(),
      totalPages: z.number(),
    }),
  });
}

/**
 * Schema genérico para respuestas paginadas estándar.
 * Usado por endpoints que retornan { items, total, page, perPage, totalPages }
 */
export function paginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    perPage: z.number(),
    totalPages: z.number(),
  });
}
