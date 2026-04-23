'use client';

/**
 * Modal para crear/editar usuario
 *
 * - Formulario con validación Zod
 * - Selección de roles
 * - Reutilizable para crear y editar
 */

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/Select';

import type { User as UserType, Role } from '../../domain/types';
import { userSchema, type UserFormData } from '../../application/validations/user.schema';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  user?: UserType | null;
  roles?: Role[];
  isLoading?: boolean;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  roles = [],
  isLoading = false,
}: UserFormModalProps) {
  const isEditing = !!user;

  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [pendingEditData, setPendingEditData] = useState<UserFormData | null>(null);
  const [editChanges, setEditChanges] = useState<FieldChange[]>([]);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      isEditing: isEditing,
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleIds: [],
      active: true,
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        isEditing: true,
        name: user.name,
        email: user.email,
        password: '',
        confirmPassword: '',
        roleIds: user.roles.map((role) => role.id),
        active: user.active,
      });
    } else {
      form.reset({
        isEditing: false,
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleIds: [],
        active: true,
      });
    }
  }, [user, form]);

  const computeEditChanges = (data: UserFormData): FieldChange[] => {
    if (!user) return [];
    const changes: FieldChange[] = [];
    if (data.name !== user.name) changes.push({ label: 'Nombre', before: user.name, after: data.name });
    if (data.email !== user.email) changes.push({ label: 'Email', before: user.email, after: data.email });
    if (data.password) changes.push({ label: 'Contraseña', before: '********', after: '(nueva contraseña)' });
    const oldRoleIds = user.roles.map((r) => r.id).sort();
    const newRoleIds = [...(data.roleIds || [])].sort();
    if (JSON.stringify(oldRoleIds) !== JSON.stringify(newRoleIds)) {
      const oldRoles = user.roles.map((r) => r.name).join(', ');
      const newRoles = (data.roleIds || []).map((id) => roles.find((r) => r.id === id)?.name ?? String(id)).join(', ');
      changes.push({ label: 'Rol', before: oldRoles, after: newRoles });
    }
    return changes;
  };

  const handleSubmit = async (data: UserFormData) => {
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
      <DialogContent className="max-w-2xl border-2 border-foreground p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 border-b-2 border-foreground sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {isEditing ? (
              <>
                <User className="h-5 w-5" />
                Editar Usuario
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                Nuevo Usuario
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Juan Carlos Pérez"
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

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.cl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contraseña */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    {isEditing ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Mínimo 8 caracteres"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirmar Contraseña */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    {isEditing ? 'Confirmar Contraseña' : 'Confirmar Contraseña *'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repite la contraseña"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rol (Dropdown) */}
            <FormField
              control={form.control}
              name="roleIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Rol *</FormLabel>
                  <FormDescription>
                    Selecciona un rol para el usuario
                  </FormDescription>
                  <Select
                    onValueChange={(value) => field.onChange([Number(value)])}
                    value={field.value?.[0]?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4 border-t">
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
                  'Crear Usuario'
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
