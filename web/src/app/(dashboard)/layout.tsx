'use client';

/**
 * Layout para las rutas del dashboard
 *
 * Aplica el DashboardLayout con sidebar a todas las páginas internas
 */

import { DashboardLayout } from '@/shared/presentation/layout';
import { AuthGuard } from '@/shared/presentation/components/AuthGuard';
import { SessionExpirationWarning } from '@/shared/presentation/components/SessionExpirationWarning';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardLayout>{children}</DashboardLayout>
      <SessionExpirationWarning />
    </AuthGuard>
  );
}
