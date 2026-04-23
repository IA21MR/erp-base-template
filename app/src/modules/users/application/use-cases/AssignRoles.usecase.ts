// Caso de uso: Asignar Roles a Usuario (RF-R1)
// El sistema debe permitir al administrador asignar uno o varios roles a cada usuario

import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User.entity';
import type { UserRepository } from '../../domain/repositories/UserRepository.interface';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import { AssignRolesCommand } from '../commands/AssignRolesCommand';
import {
  UserNotFoundException,
  InvalidUserDataException,
  RoleNotFoundException,
} from '../../domain/exceptions';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '../../Users.Tokens';

@Injectable()
export class AssignRolesUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(
    command: AssignRolesCommand,
    assignedBy: number,
    callerOrganizationId?: string,
  ): Promise<User> {
    // Buscar usuario
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new UserNotFoundException(command.userId);
    }

    // Guardia multi-tenant
    if (callerOrganizationId && !user.belongsToOrganization(callerOrganizationId)) {
      throw new UserNotFoundException(command.userId);
    }

    // Validar roles
    if (!command.roleIds || command.roleIds.length === 0) {
      throw new InvalidUserDataException('Debe asignar al menos un rol al usuario');
    }

    // Verificar que todos los roles existan
    for (const roleId of command.roleIds) {
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new RoleNotFoundException(roleId);
      }
    }

    // Asignar roles al usuario
    user.assignRoles(command.roleIds);

    // Persistir cambios
    await this.userRepository.assignRoles(user.id, command.roleIds);

    // Actualizar usuario
    const updatedUser = await this.userRepository.findById(user.id);

    return updatedUser!;
  }
}
