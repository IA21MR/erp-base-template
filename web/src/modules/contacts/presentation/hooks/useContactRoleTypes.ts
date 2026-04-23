'use client';

import { useQuery } from '@tanstack/react-query';
import { contactsRepository } from '../../infrastructure/repositories';

export const CONTACT_ROLE_TYPES_QUERY_KEY = 'contact-role-types';

export function useContactRoleTypes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [CONTACT_ROLE_TYPES_QUERY_KEY],
    queryFn: () => contactsRepository.listRoleTypes(),
    staleTime: 1000 * 60 * 30,
    enabled: options?.enabled ?? true,
  });
}
