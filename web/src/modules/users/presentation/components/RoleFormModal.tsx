/**
 * Modal para crear/editar rol
 *
 * - Formulario con validación Zod
 * - Selección de permisos agrupados por módulo
 * - Reutilizable para crear y editar
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Loader2 } from 'lucide-react';
import { EditConfirmationDialog, type FieldChange } from '@/shared/presentation/components/ui/EditConfirmationDialog';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/components/ui/Dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/shared/presentation/components/ui/Form';
import { Input } from '@/shared/presentation/components/ui/Input';
import { Button } from '@/shared/presentation/components/ui/Button';
import { PermissionSelector } from './PermissionSelector';

import type { Role, PermissionsByModule } from '../../domain/types/role.types';
import { roleSchema, type RoleFormData } from '../../application/validations/role.schema';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  role?: Role | null;
  permissionsByModule: PermissionsByModule[];
  isLoading?: boolean;
}

export function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  role,
  permissionsByModule,
  isLoading = false,
}: RoleFormModalProps) {
  const isEditing = !!role;

  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<RoleFormData | null>(null);
  const [editChanges, setEditChanges] = useState<FieldChange[]>([]);

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      permissionIds: [],
    },
  });

  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        permissionIds: role.permissions.map((p) => p.id),
      });
    } else {
      form.reset({
        name: '',
        permissionIds: [],
      });
    }
  }, [role, form]);

  const computeEditChanges = (data: RoleFormData): FieldChange[] => {
    if (!role) return [];
    const changes: FieldChange[] = [];
    if (data.name !== role.name) changes.push({ label: 'Nombre', before: role.name, after: data.name });
    const oldIds = role.permissions.map((p) => p.id).sort();
    const newIds = [...(data.permissionIds || [])].sort();
    if (JSON.stringify(oldIds) !== JSON.stringify(newIds)) {
      const allPerms = permissionsByModule.flatMap((m) => m.permissions);
      const added = newIds.filter((id) => !oldIds.includes(id)).map((id) => allPerms.find((p) => p.id === id)?.description ?? String(id));
      const removed = oldIds.filter((id) => !newIds.includes(id)).map((id) => allPerms.find((p) => p.id === id)?.description ?? String(id));
      const parts: string[] = [];
      if (added.length) parts.push(`+${added.length} agregados`);
      if (removed.length) parts.push(`-${removed.length} removidos`);
      changes.push({ label: 'Permisos', before: `${oldIds.length} permisos`, after: `${newIds.length} permisos (${parts.join(', ')})` });
    }
    return changes;
  };

  const handleSubmit = async (data: RoleFormData) => {
    if (isEditing) {
      const changes = computeEditChanges(data);
      if (changes.length === 0) { onClose(); return; }
      setEditChanges(changes);
      setPendingEditData(data);
      setShowEditConfirmation(true);
      return;
    }
    await onSubmit(data);
    onClose();
  };

  const handleConfirmEdit = async () => {
    if (!pendingEditData) return;
    await onSubmit(pendingEditData);
    setShowEditConfirmation(false);
    setPendingEditData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-2 border-foreground p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="p-6 border-b-2 border-foreground">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {isEditing ? `Editar Rol: ${role.name}` : 'Nuevo Rol'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Nombre del Rol *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Operario, Supervisor, Administrador"
                        {...field}
                        onChange={(e) => {
                          const filtered = e.target.value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙ\s'-]/g, '');
                          field.onChange(filtered.toUpperCase());
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Permisos */}
              <FormField
                control={form.control}
                name="permissionIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Permisos del Rol *</FormLabel>
                    <FormDescription>
                      Selecciona los permisos que tendrá este rol. Puedes seleccionar módulos completos.
                    </FormDescription>
                    <FormControl>
                      <PermissionSelector
                        permissionsByModule={permissionsByModule}
                        selectedPermissionIds={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 p-6 border-t-2 border-foreground bg-background">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : isEditing ? (
                  'Guardar Cambios'
                ) : (
                  'Crear Rol'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      <EditConfirmationDialog
        open={showEditConfirmation}
        onOpenChange={setShowEditConfirmation}
        onConfirm={handleConfirmEdit}
        changes={editChanges}
        isLoading={isLoading}
      />
    </Dialog>
  );
}
