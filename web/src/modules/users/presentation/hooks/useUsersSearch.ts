'use client';

import { useQuery } from '@tanstack/react-query';
import { usersRepository } from '../../infrastructure/repositories';
import type { UserFilters } from '../../domain/types';

export const USERS_SEARCH_QUERY_KEY = 'users-search';

function mapStatusToActive(status: string): boolean | undefined {
  if (status === 'ACTIVOS') return true;
  if (status === 'INACTIVOS') return false;
  return undefined;
}

export function useUsersSearch(
  filters: UserFilters,
  page: number,
  perPage: number,
) {
  const { search, status, roleId } = filters;
  const active = mapStatusToActive(status);

  return useQuery({
    queryKey: [USERS_SEARCH_QUERY_KEY, { search, status, roleId, page, perPage }],
    queryFn: () =>
      usersRepository.search({
        query: search || undefined,
        active,
        roleId: roleId ?? undefined,
        page,
        perPage,
      }),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
}
