'use client';

import { useQuery } from '@tanstack/react-query';
import { contactsRepository } from '../../infrastructure/repositories';
import type { ContactFilters } from '../../domain/types';

export const CONTACTS_SEARCH_QUERY_KEY = 'contacts-search';

function mapStatusToActive(status: string): boolean | undefined {
  if (status === 'ACTIVOS') return true;
  if (status === 'INACTIVOS') return false;
  return undefined;
}

export function useContactsSearch(filters: ContactFilters, page: number, perPage: number) {
  const { search, status, type, organizationId, roleTypeId, assignedToUserId } = filters;
  const active = mapStatusToActive(status);

  return useQuery({
    queryKey: [
      CONTACTS_SEARCH_QUERY_KEY,
      { search, status, type, organizationId, roleTypeId, assignedToUserId, page, perPage },
    ],
    queryFn: () =>
      contactsRepository.list({
        query: search || undefined,
        active,
        type: type ?? undefined,
        organizationId: organizationId ?? undefined,
        roleTypeId: roleTypeId ?? undefined,
        assignedToUserId: assignedToUserId ?? undefined,
        page,
        perPage,
      }),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
  });
}
