// Caso de uso: Desactivar Usuario (RF-U1)
// El sistema debe permitir desactivar usuarios sin eliminarlos del sistema

import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User.entity';
import type { UserRepository } from '../../domain/repositories/UserRepository.interface';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import {
  UserNotFoundException,
  SelfDeactivationException,
  AdminDeactivationForbiddenException,
} from '../../domain/exceptions';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '../../Users.Tokens';

@Injectable()
export class DeactivateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(
    userId: number,
    deactivatedBy: number,
    callerTenantId?: string | null,
  ): Promise<User> {
    // Validar que no se desactive a sí mismo
    if (userId === deactivatedBy) {
      throw new SelfDeactivationException();
    }

    // Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Guardia multi-tenant
    if (callerTenantId && !user.belongsToTenant(callerTenantId)) {
      throw new UserNotFoundException(userId);
    }

    // Regla de negocio: un administrador no puede desactivar a otro administrador
    const adminRole = await this.roleRepository.findByName('Administrador');
    if (adminRole) {
      const deactivator = await this.userRepository.findById(deactivatedBy);
      if (!deactivator) {
        throw new UserNotFoundException(deactivatedBy);
      }

      const deactivatorIsAdmin = deactivator.hasRole(adminRole.id);
      const targetIsAdmin = user.hasRole(adminRole.id);

      if (deactivatorIsAdmin && targetIsAdmin) {
        throw new AdminDeactivationForbiddenException();
      }
    }

    // Desactivar usuario (la entidad valida si ya está inactivo)
    user.deactivate();

    // Persistir cambios
    const updatedUser = await this.userRepository.update(user);

    return updatedUser;
  }
}
