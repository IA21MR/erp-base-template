'use client';

import { Plus, Shield } from 'lucide-react';
import { PermissionButton } from '@/shared/presentation/components/PermissionButton';
import { ModulePageHeader } from '@/shared/presentation/components/ModulePageHeader';

interface RolesPageHeaderProps {
  onCreateRole: () => void;
}

export function RolesPageHeader({ onCreateRole }: RolesPageHeaderProps) {
  return (
    <ModulePageHeader
      title=""
      className="mb-4"
      actions={
        <PermissionButton
          requiredPermission="CREATE_ROLE"
          size="default"
          onClick={onCreateRole}
        >
          <Plus className="mr-2 h-4 w-4" />
          Crear Rol
        </PermissionButton>
      }
    />
  );
}
