/**
 * Página de Usuarios
 *
 * Usa el UsersView del módulo users
 */

import { UsersView } from '@/modules/users/presentation/views';
import { ProtectedRoute } from '@/modules/auth/presentation/components/ProtectedRoute';

export const metadata = {
  title: 'Usuarios | SOTEK',
  description: 'Gestión de usuarios del sistema',
};

export default function UsersPage() {
  return (
    <ProtectedRoute
      requiredPermissions={['LIST_USERS']}
      unauthorizedMessage="No tienes permisos para gestionar usuarios. Contacta con un administrador."
    >
      <UsersView />
    </ProtectedRoute>
  );
}
