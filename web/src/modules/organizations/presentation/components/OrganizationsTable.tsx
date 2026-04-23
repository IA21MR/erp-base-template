'use client';

/**
 * Tabla de organizaciones
 */
import { Pencil, Power, PowerOff, Star, Settings } from 'lucide-react';
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
import type { Organization } from '../../domain/types';

interface OrganizationsTableProps {
  organizations: Organization[];
  onEdit: (org: Organization) => void;
  onToggleActive: (org: Organization) => void;
  onSetPrimary: (org: Organization) => void;
  onEditSettings: (org: Organization) => void;
}

export function OrganizationsTable({
  organizations,
  onEdit,
  onToggleActive,
  onSetPrimary,
  onEditSettings,
}: OrganizationsTableProps) {
  if (organizations.length === 0) {
    return (
      <div className="border-2 border-foreground p-12 text-center bg-card">
        <div className="w-16 h-16 border-2 border-foreground mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">🏢</span>
        </div>
        <h3 className="font-bold text-lg mb-2">Sin resultados</h3>
        <p className="text-muted-foreground">
          No se encontraron organizaciones con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="border-2 border-foreground overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-foreground bg-muted hover:bg-muted">
            <TableHead className="font-bold">Razón Social</TableHead>
            <TableHead className="font-bold">Nombre Comercial</TableHead>
            <TableHead className="font-bold">Tax ID</TableHead>
            <TableHead className="font-bold">País</TableHead>
            <TableHead className="font-bold">Primaria</TableHead>
            <TableHead className="font-bold">Estado</TableHead>
            <TableHead className="font-bold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations.map((org) => (
            <TableRow key={org.id} className="border-b border-border hover:bg-accent/50">
              <TableCell className="font-medium">{org.legalName}</TableCell>
              <TableCell className="text-sm">{org.tradeName ?? '—'}</TableCell>
              <TableCell className="font-mono text-sm">{org.taxId}</TableCell>
              <TableCell>{org.countryCode}</TableCell>
              <TableCell>
                {org.isPrimary ? (
                  <Badge variant="default" className="gap-1">
                    <Star className="h-3 w-3" /> Primaria
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={org.active ? 'default' : 'destructive'}>
                  {org.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <PermissionButton
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(org)}
                    title="Editar"
                    requiredPermission="UPDATE_ORGANIZATION"
                  >
                    <Pencil className="h-4 w-4" />
                  </PermissionButton>
                  <PermissionButton
                    variant="outline"
                    size="sm"
                    onClick={() => onEditSettings(org)}
                    title="Configuración"
                    requiredPermission="MANAGE_ORGANIZATION_SETTINGS"
                  >
                    <Settings className="h-4 w-4" />
                  </PermissionButton>
                  {!org.isPrimary && (
                    <PermissionButton
                      variant="outline"
                      size="sm"
                      onClick={() => onSetPrimary(org)}
                      title="Marcar como primaria"
                      requiredPermission="SET_PRIMARY_ORGANIZATION"
                    >
                      <Star className="h-4 w-4" />
                    </PermissionButton>
                  )}
                  <PermissionButton
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleActive(org)}
                    title={org.active ? 'Desactivar' : 'Activar'}
                    requiredPermission={
                      org.active ? 'DEACTIVATE_ORGANIZATION' : 'ACTIVATE_ORGANIZATION'
                    }
                  >
                    {org.active ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
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
