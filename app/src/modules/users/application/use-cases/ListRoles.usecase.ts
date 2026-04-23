// Caso de uso: Listar Roles
// Obtener todos los roles del sistema con sus permisos

import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../domain/entities/Role.entity';
import { Permission } from '../../domain/entities/Permission.entity';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import type { PermissionRepository } from '../../domain/repositories/PermissionRepository.interface';
import { ROLE_REPOSITORY, PERMISSION_REPOSITORY } from '../../Users.Tokens';
import { computeTotalPages } from '../../../../shared/domain/Pagination';

export interface RoleWithPermissions {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface ListRolesResult {
  items: RoleWithPermissions[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

@Injectable()
export class ListRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(page: number = 1, perPage: number = 30): Promise<ListRolesResult> {
    // Obtener roles paginados
    const result = await this.roleRepository.listPaginated(page, perPage);

    // Obtener permisos para cada rol
    // Batch: obtener todos los permissionIds únicos de los roles
    const allPermissionIds = [...new Set(result.items.flatMap((role) => role.permissionIds))];
    const permissions = await this.permissionRepository.findByIds(allPermissionIds);
    const permissionsMap = new Map(permissions.map((p) => [p.id, p]));

    // Mapear roles con sus permisos
    const rolesWithPermissions: RoleWithPermissions[] = result.items.map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissionIds
        .map((id) => permissionsMap.get(id))
        .filter((p): p is Permission => p !== undefined),
    }));

    return {
      items: rolesWithPermissions,
      meta: {
        total: result.total,
        page,
        perPage,
        totalPages: computeTotalPages(result.total, perPage),
      },
    };
  }
}
