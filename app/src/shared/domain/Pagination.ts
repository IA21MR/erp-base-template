/**
 * Pagination — shared/domain
 *
 * Tipos genéricos de paginación reutilizables en todos los módulos.
 */

export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export function computeTotalPages(total: number, perPage: number): number {
  return Math.ceil(total / perPage);
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  perPage: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    perPage,
    totalPages: computeTotalPages(total, perPage),
  };
}
