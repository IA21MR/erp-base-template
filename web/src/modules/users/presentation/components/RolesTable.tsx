/**
 * Tabla de roles
 *
 * - Columnas: Nombre, Permisos, Acciones
 * - Acciones: Editar, Eliminar
 */

'use client';

import { Pencil, Trash2, Shield } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/components/ui/Table';
import { Badge } from '@/shared/presentation/components/ui/Badge';
import { PermissionButton } from '@/shared/presentation/components/PermissionButton';
import type { Role } from '../../domain/types/role.types';

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RolesTable({ roles, onEdit, onDelete }: RolesTableProps) {
  if (roles.length === 0) {
    return (
      <div className="border-2 border-foreground p-8 text-center">
        <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No hay roles registrados</p>
        <p className="text-sm text-muted-foreground mt-2">
          Crea el primer rol para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-foreground hover:bg-muted/50">
            <TableHead className="font-bold">Nombre</TableHead>
            <TableHead className="font-bold">Permisos</TableHead>
            <TableHead className="font-bold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id} className="border-b border-foreground">
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  {role.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1 max-w-2xl">
                  {role.permissions.length > 0 ? (
                    <>
                      {role.permissions.slice(0, 5).map((permission) => (
                        <Badge key={permission.id} variant="secondary" className="text-xs">
                          {permission.code}
                        </Badge>
                      ))}
                      {role.permissions.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 5} más
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin permisos</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <PermissionButton
                    requiredPermission="UPDATE_ROLE"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(role)}
                  >
                    <Pencil className="h-4 w-4" />
                  </PermissionButton>
                  <PermissionButton
                    requiredPermission="DELETE_ROLE"
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(role)}
                  >
                    <Trash2 className="h-4 w-4" />
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
