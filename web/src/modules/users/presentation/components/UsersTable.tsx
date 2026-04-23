'use client';

/**
 * Tabla de usuarios
 *
 * - Listado con columnas clave
 * - Badges para estado y roles
 * - Acciones: editar, activar/desactivar
 */

import { Pencil, UserCheck, UserX } from 'lucide-react';
import { PermissionButton } from '@/shared/presentation/components/PermissionButton';
import { Badge } from '@/shared/presentation/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/presentation/components/ui/Table';
import type { User } from '../../domain/types';

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
}

export function UsersTable({
  users,
  onEdit,
  onToggleActive,
}: UsersTableProps) {
  if (users.length === 0) {
    return (
      <div className="border-2 border-foreground p-12 text-center bg-card">
        <div className="w-16 h-16 border-2 border-foreground mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="font-bold text-lg mb-2">Sin resultados</h3>
        <p className="text-muted-foreground">
          No se encontraron usuarios con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-foreground bg-muted hover:bg-muted">
            <TableHead className="font-bold">Nombre</TableHead>
            <TableHead className="font-bold">Email</TableHead>
            <TableHead className="font-bold">Roles</TableHead>
            <TableHead className="font-bold">Estado</TableHead>
            <TableHead className="font-bold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className="border-b border-border hover:bg-accent/50"
            >
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-sm">{user.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role.id} variant="secondary">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.active ? 'default' : 'destructive'}>
                  {user.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <PermissionButton
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    title="Editar"
                    requiredPermission="UPDATE_USER"
                  >
                    <Pencil className="h-4 w-4" />
                  </PermissionButton>
                  <PermissionButton
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleActive(user)}
                    title={user.active ? 'Desactivar' : 'Activar'}
                    requiredPermission={user.active ? 'DEACTIVATE_USER' : 'ACTIVATE_USER'}
                  >
                    {user.active ? (
                      <UserX className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </PermissionButton>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
