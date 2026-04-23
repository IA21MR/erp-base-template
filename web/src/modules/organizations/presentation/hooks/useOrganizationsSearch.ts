'use client';

import { useQuery } from '@tanstack/react-query';
import { organizationsRepository } from '../../infrastructure/repositories';
import type { OrganizationFilters } from '../../domain/types';

export const ORGANIZATIONS_SEARCH_QUERY_KEY = 'organizations-search';

function mapStatusToActive(status: string): boolean | undefined {
  if (status === 'ACTIVOS') return true;
  if (status === 'INACTIVOS') return false;
  return undefined;
}

export function useOrganizationsSearch(
  filters: OrganizationFilters,
  page: number,
  perPage: number,
) {
  const { search, status, countryCode } = filters;
  const active = mapStatusToActive(status);

  return useQuery({
    queryKey: [
      ORGANIZATIONS_SEARCH_QUERY_KEY,
      { search, status, countryCode, page, perPage },
    ],
    queryFn: () =>
      organizationsRepository.search({
        query: search || undefined,
        active,
        countryCode: countryCode || undefined,
        page,
        perPage,
      }),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}
