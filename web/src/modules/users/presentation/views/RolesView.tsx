/**
 * Vista principal del módulo Roles
 *
 * Integra todos los componentes:
 * - Header con botón crear
 * - Tabla de roles
 * - Modal crear/editar
 */

'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/shared/utils';
import { RolesPageHeader } from '../components/RolesPageHeader';
import { RolesTable } from '../components/RolesTable';
import { RoleFormModal } from '../components/RoleFormModal';
import { useRolesManagement } from '../hooks/useRolesManagement';
import { useAllPermissions } from '../hooks/useAllPermissions';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { ToastNotifications } from '@/shared/presentation/components/ui/ToastNotifications';
import { DeleteConfirmDialog } from '@/shared/presentation/components/ui/DeleteConfirmDialog';
import type { Role } from '../../domain/types/role.types';
import type { RoleFormData } from '../../application/validations/role.schema';

export function RolesView() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { roles, isLoading, error: rolesError, createRole, updateRole, deleteRole } = useRolesManagement();
  const { permissionsByModule, isLoading: permissionsLoading, error: permissionsError } = useAllPermissions();
  const { toasts, removeToast, success, error: showError } = useToast();

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsFormModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsFormModalOpen(true);
  };

  const handleDeleteRole = async (role: Role) => {
    setRoleToDelete(role);
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRole(roleToDelete.id);
      success('Rol eliminado exitosamente');
      setRoleToDelete(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Error al eliminar rol');
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = async (data: RoleFormData) => {
    try {
      if (selectedRole) {
        await updateRole(selectedRole.id, data);
        success('Rol actualizado exitosamente');
      } else {
        await createRole(data);
        success('Rol creado exitosamente');
      }
      setIsFormModalOpen(false);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Error al guardar rol');
      showError(errorMessage);
      throw error;
    }
  };

  if (isLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando roles...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      <ToastNotifications toasts={toasts} onClose={removeToast} />

      {(rolesError || permissionsError) && (
        <div className="mb-4 p-4 border-2 border-destructive bg-destructive/10 text-destructive">
          <p className="font-bold">Error:</p>
          <p>{rolesError || permissionsError}</p>
        </div>
      )}

      <RolesPageHeader onCreateRole={handleCreateRole} />

      <div className="mt-0">
        <RolesTable roles={roles} onEdit={handleEditRole} onDelete={handleDeleteRole} />
      </div>

      {/* Modal Crear/Editar */}
      <RoleFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        role={selectedRole}
        permissionsByModule={permissionsByModule}
        isLoading={isLoading}
      />

      {/* Diálogo confirmar eliminación */}
      <DeleteConfirmDialog
        open={!!roleToDelete}
        onOpenChange={(open) => { if (!open) setRoleToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Rol"
        description={`¿Estás seguro de eliminar el rol "${roleToDelete?.name}"?`}
        isLoading={isDeleting}
      />
    </>
  );
}
