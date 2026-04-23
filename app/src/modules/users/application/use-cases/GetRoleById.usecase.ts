// Caso de uso: Obtener Rol por ID
// Obtener un rol específico del sistema con sus permisos

import { Inject, Injectable } from '@nestjs/common';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import type { PermissionRepository } from '../../domain/repositories/PermissionRepository.interface';
import { RoleDetailResult } from '../results/RoleDetailResult';
import { RoleNotFoundException } from '../../domain/exceptions/RoleNotFoundException';
import { ROLE_REPOSITORY, PERMISSION_REPOSITORY } from '../../Users.Tokens';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(roleId: number): Promise<RoleDetailResult> {
    // Buscar el rol por ID
    const role = await this.roleRepository.findById(roleId);

    // Si no existe, lanzar excepción de dominio
    if (!role) {
      throw new RoleNotFoundException(roleId);
    }

    // Obtener los permisos del rol (ya tiene permissionIds del include)
    const permissions =
      await this.permissionRepository.findByIds(role.permissionIds);

    // Retornar el resultado con el rol y sus permisos
    return new RoleDetailResult(role, permissions);
  }
}
