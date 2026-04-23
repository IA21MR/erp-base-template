// Caso de uso: Activar Usuario (RF-U1)
// El sistema debe permitir activar usuarios sin eliminarlos del sistema

import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User.entity';
import type { UserRepository } from '../../domain/repositories/UserRepository.interface';
import { UserNotFoundException } from '../../domain/exceptions';
import { USER_REPOSITORY } from '../../Users.Tokens';

@Injectable()
export class ActivateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    userId: number,
    activatedBy: number,
    callerOrganizationId?: string,
  ): Promise<User> {
    // Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Guardia multi-tenant
    if (callerOrganizationId && !user.belongsToOrganization(callerOrganizationId)) {
      throw new UserNotFoundException(userId);
    }

    // Activar usuario (la entidad valida si ya está activo)
    user.activate();

    // Persistir cambios
    const updatedUser = await this.userRepository.update(user);

    return updatedUser;
  }
}
