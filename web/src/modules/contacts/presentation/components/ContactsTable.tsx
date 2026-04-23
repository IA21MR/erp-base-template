'use client';

/**
 * Tabla de contactos
 */
import { Pencil, Power, PowerOff, User, Building2 } from 'lucide-react';
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
import type { Contact, ContactRoleType } from '../../domain/types';

interface Props {
  contacts: Contact[];
  roleTypes?: ContactRoleType[];
  onEdit: (c: Contact) => void;
  onToggleActive: (c: Contact) => void;
}

export function ContactsTable({ contacts, roleTypes = [], onEdit, onToggleActive }: Props) {
  if (contacts.length === 0) {
    return (
      <div className="border-2 border-foreground p-12 text-center bg-card">
        <div className="w-16 h-16 border-2 border-foreground mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">📇</span>
        </div>
        <h3 className="font-bold text-lg mb-2">Sin resultados</h3>
        <p className="text-muted-foreground">
          No se encontraron contactos con los filtros seleccionados.
        </p>
      </div>
    );
  }
  const roleLabel = (id: string) => roleTypes.find((r) => r.id === id)?.label ?? id;
  return (
    <div className="border-2 border-foreground overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-foreground bg-muted hover:bg-muted">
            <TableHead className="font-bold">Tipo</TableHead>
            <TableHead className="font-bold">Nombre</TableHead>
            <TableHead className="font-bold">Tax ID</TableHead>
            <TableHead className="font-bold">Email principal</TableHead>
            <TableHead className="font-bold">Teléfono</TableHead>
            <TableHead className="font-bold">Roles</TableHead>
            <TableHead className="font-bold">Estado</TableHead>
            <TableHead className="font-bold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((c) => {
            const primaryEmail = c.emails.find((e) => e.isPrimary) ?? c.emails[0];
            const primaryPhone = c.phones.find((p) => p.isPrimary) ?? c.phones[0];
            return (
              <TableRow key={c.id} className="border-b border-border hover:bg-accent/50">
                <TableCell>
                  {c.type === 'PERSON' ? (
                    <Badge variant="secondary" className="gap-1">
                      <User className="h-3 w-3" /> Persona
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Building2 className="h-3 w-3" /> Empresa
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">{c.displayName}</TableCell>
                <TableCell className="font-mono text-sm">{c.taxId ?? '—'}</TableCell>
                <TableCell className="text-sm">{primaryEmail?.email ?? '—'}</TableCell>
                <TableCell className="text-sm">{primaryPhone?.phone ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {c.roles.map((r) => (
                      <Badge key={r.id} variant="outline">
                        {roleLabel(r.roleTypeId)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={c.active ? 'default' : 'destructive'}>
                    {c.active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <PermissionButton
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(c)}
                      title="Editar"
                      requiredPermission="UPDATE_CONTACT"
                    >
                      <Pencil className="h-4 w-4" />
                    </PermissionButton>
                    <PermissionButton
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleActive(c)}
                      title={c.active ? 'Desactivar' : 'Activar'}
                      requiredPermission={c.active ? 'DEACTIVATE_CONTACT' : 'ACTIVATE_CONTACT'}
                    >
                      {c.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                    </PermissionButton>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
