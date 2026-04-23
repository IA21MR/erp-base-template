/**
 * Página de Gestión de Roles
 * 
 * Ruta: /dashboard/roles
 */

'use client';

import { ProtectedRoute } from '@/modules/auth/presentation/components/ProtectedRoute';
import { RolesView } from '@/modules/users/presentation/views/RolesView';

export default function RolesPage() {
  return (
    <ProtectedRoute requiredPermissions={['READ_ROLE']}>
      <RolesView />
    </ProtectedRoute>
  );
}
