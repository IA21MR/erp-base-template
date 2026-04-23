/**
 * Modal para gestionar roles
 *
 * - Lista de roles existentes
 * - Crear nuevo rol
 * - Editar rol existente
 * - Eliminar rol
 */

'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/shared/utils';
import { Shield, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/components/ui/Dialog';
import { Button } from '@/shared/presentation/components/ui/Button';
import { RolesTable } from './RolesTable';
import { RoleFormModal } from './RoleFormModal';
import { useRolesManagement } from '../hooks/useRolesManagement';
import { useAllPermissions } from '../hooks/useAllPermissions';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { ToastNotifications } from '@/shared/presentation/components/ui/ToastNotifications';
import { DeleteConfirmDialog } from '@/shared/presentation/components/ui/DeleteConfirmDialog';
import type { Role } from '../../domain/types/role.types';
import type { RoleFormData } from '../../application/validations/role.schema';

interface RolesManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RolesManagementModal({ isOpen, onClose }: RolesManagementModalProps) {
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

  return (
    <>
      {/* Toast Notifications */}
      <ToastNotifications toasts={toasts} onClose={removeToast} />

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl border-2 border-foreground p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="p-6 border-b-2 border-foreground">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Gestión de Roles y Permisos
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-6">
            {(isLoading || permissionsLoading) && (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Cargando roles...</p>
                </div>
              </div>
            )}

            {(rolesError || permissionsError) && (
              <div className="mb-4 p-4 border-2 border-destructive bg-destructive/10 text-destructive">
                <p className="font-bold">Error:</p>
                <p>{rolesError || permissionsError}</p>
              </div>
            )}

            {!isLoading && !permissionsLoading && (
              <RolesTable roles={roles} onEdit={handleEditRole} onDelete={handleDeleteRole} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Crear/Editar Rol */}
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
