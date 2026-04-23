// Caso de uso: Eliminar Rol (RF-R3)
// El sistema debe permitir eliminar roles existentes, siempre que no estén asignados a ningún usuario

import { Inject, Injectable } from '@nestjs/common';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import {
  RoleNotFoundException,
  RoleHasUsersException,
} from '../../domain/exceptions';
import { ROLE_REPOSITORY } from '../../Users.Tokens';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(roleId: number): Promise<void> {
    // Buscar rol
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundException(roleId);
    }

    // RF-R3: Validar que el rol no esté asignado a ningún usuario
    const isAssigned = await this.roleRepository.isAssignedToUser(roleId);
    if (isAssigned) {
      throw new RoleHasUsersException(roleId);
    }

    // Eliminar rol
    await this.roleRepository.delete(roleId);
  }
}
