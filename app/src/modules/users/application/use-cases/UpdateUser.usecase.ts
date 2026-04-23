// Caso de uso: Actualizar Usuario (RF-U1)
// El sistema debe permitir editar usuarios existentes, permitiendo modificar sus datos básicos

import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User.entity';
import { Password } from '../../domain/value-objects/Password.vo';
import type { UserRepository } from '../../domain/repositories/UserRepository.interface';
import { UpdateUserCommand } from '../commands/UpdateUserCommand';
import {
  UserNotFoundException,
  DuplicateEmailException,
} from '../../domain/exceptions';
import { USER_REPOSITORY } from '../../Users.Tokens';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    userId: number,
    command: UpdateUserCommand,
    _updatedBy: number,
    callerTenantId?: string | null,
  ): Promise<User> {
    // Buscar usuario
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    // Guardia multi-tenant
    if (callerTenantId && !user.belongsToTenant(callerTenantId)) {
      throw new UserNotFoundException(userId);
    }

    // Actualizar nombre y email si se proporcionan
    if (command.name || command.email) {
      const newName = command.name || user.name;
      const newEmail = command.email || user.email.value;

      // Validar que el nuevo email no esté en uso por otro usuario
      if (command.email && command.email !== user.email.value) {
        const existingUser = await this.userRepository.findByEmail(command.email);
        if (existingUser && existingUser.id !== userId) {
          throw new DuplicateEmailException(command.email);
        }
      }

      user.updateBasicInfo(newName, newEmail);
    }

    // Actualizar contraseña si se proporciona
    if (command.password) {
      const password = Password.create(command.password);
      const passwordHash = await bcrypt.hash(password.toString(), 10);
      user.updatePassword(passwordHash);
    }

    // Persistir cambios
    const updatedUser = await this.userRepository.update(user);

    return updatedUser;
  }
}
