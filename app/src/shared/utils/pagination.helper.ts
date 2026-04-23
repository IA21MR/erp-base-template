/**
 * Utilidades de paginación compartidas
 *
 * Centraliza el cálculo de offset para evitar repetir la fórmula
 * `(page - 1) * perPage` en cada repositorio.
 */

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

/**
 * Calcula el offset (skip) para queries paginadas.
 * Garantiza que el resultado nunca sea negativo.
 */
export function calculateSkip(page: number, perPage: number): number {
  return Math.max(0, (page - 1) * perPage);
}
