// Caso de uso: Obtener Usuario por ID (RF-U2)
// El sistema debe permitir visualizar los detalles de un usuario específico

import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User.entity';
import { Role } from '../../domain/entities/Role.entity';
import type { UserRepository } from '../../domain/repositories/UserRepository.interface';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import {
  UserNotFoundException,
  InvalidUserDataException,
} from '../../domain/exceptions';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '../../Users.Tokens';

export interface UserDetailWithRoles {
  id: number;
  name: string;
  email: string;
  active: boolean;
  roles: Role[];
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(userId: number, callerTenantId?: string | null): Promise<UserDetailWithRoles> {
    // Validar que el ID sea válido
    if (!userId || userId <= 0) {
      throw new InvalidUserDataException('ID de usuario inválido');
    }

    // Buscar el usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Guardia multi-tenant: evita leak de existencia cross-tenant.
    if (callerTenantId && !user.belongsToTenant(callerTenantId)) {
      throw new UserNotFoundException(userId);
    }

    // Obtener roles del usuario en una sola query
    const roles = await this.roleRepository.findByIds(user.roleIds);

    return {
      id: user.id,
      name: user.name,
      email: user.email.value,
      active: user.active,
      roles,
    };
  }
}
