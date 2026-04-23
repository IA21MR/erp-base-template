/**
 * Pagination — shared/domain
 *
 * Tipos genéricos de paginación reutilizables en todos los módulos del frontend.
 */

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
