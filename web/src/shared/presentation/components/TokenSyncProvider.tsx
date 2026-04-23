'use client';

import { useTokenSync } from '@/shared/presentation/hooks/useTokenSync';

/**
 * Componente para sincronizar tokens entre localStorage y cookies
 * Debe montarse en el layout principal
 */
export function TokenSyncProvider({ children }: { children: React.ReactNode }) {
  useTokenSync();
  return <>{children}</>;
}
