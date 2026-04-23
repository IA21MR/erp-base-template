/**
 * Página de Organizaciones
 */
import { OrganizationsView } from '@/modules/organizations/presentation/views';
import { ProtectedRoute } from '@/modules/auth/presentation/components/ProtectedRoute';

export const metadata = {
  title: 'Organizaciones | SOTEK',
  description: 'Gestión de organizaciones',
};

export default function OrganizationsPage() {
  return (
    <ProtectedRoute
      requiredPermissions={['READ_ORGANIZATION']}
      unauthorizedMessage="No tienes permisos para gestionar organizaciones."
    >
      <OrganizationsView />
    </ProtectedRoute>
  );
}
