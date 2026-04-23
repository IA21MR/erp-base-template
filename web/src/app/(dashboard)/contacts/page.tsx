/**
 * Página de Contactos
 */
import { ContactsView } from '@/modules/contacts/presentation/views';
import { ProtectedRoute } from '@/modules/auth/presentation/components/ProtectedRoute';

export const metadata = {
  title: 'Contactos | SOTEK',
  description: 'Gestión de contactos',
};

export default function ContactsPage() {
  return (
    <ProtectedRoute
      requiredPermissions={['READ_CONTACT']}
      unauthorizedMessage="No tienes permisos para gestionar contactos."
    >
      <ContactsView />
    </ProtectedRoute>
  );
}
