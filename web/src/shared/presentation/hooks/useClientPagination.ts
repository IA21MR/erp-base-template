/**
 * useClientPagination — shared/presentation/hooks
 *
 * Hook para paginación client-side con filtrado.
 * Reemplaza el patrón repetido de useMemo + slice + totalPages.
 */

import { useMemo, useState } from 'react';

interface UseClientPaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
}

interface UseClientPaginationResult<T> {
  paginatedItems: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
}

export function useClientPagination<T>(
  items: T[],
  options: UseClientPaginationOptions = {},
): UseClientPaginationResult<T> {
  const { initialPage = 1, itemsPerPage = 10 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  return {
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage,
  };
}
