// Caso de uso: Crear Usuario (RF-U1)
//
// Multi-tenant: el `tenantId` viene del contexto del admin autenticado (JWT).
// Este use-case NO importa nada del módulo `organizations`: la existencia del
// tenant queda garantizada por:
//   - el JWT (`OrganizationContextGuard` ya validó el tenant al emitirlo), y
//   - el FK de Prisma (cuando `organizations` está activo).
// En proyectos core-only `tenantId` es `null` y el FK no existe.

import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User.entity';
import { Password } from '../../domain/value-objects/Password.vo';
import type { UserRepository } from '../../domain/repositories/UserRepository.interface';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import { CreateUserCommand } from '../commands/CreateUserCommand';
import {
  DuplicateEmailException,
  InvalidUserDataException,
  RoleNotFoundException,
} from '../../domain/exceptions';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '../../Users.Tokens';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(command: CreateUserCommand, _createdBy: number): Promise<User> {
    // Validar que el email no exista
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new DuplicateEmailException(command.email);
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

    // Validar contraseña usando Value Object
    const password = Password.create(command.password);

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password.toString(), 10);

    // Crear usuario (tenantId puede ser null en proyectos core-only)
    const user = User.create(
      0, // ID temporal, se asignará en la BD
      command.tenantId ?? null,
      command.name,
      command.email,
      passwordHash,
      true, // Activo por defecto
      command.roleIds,
    );

    // Persistir usuario
    const createdUser = await this.userRepository.create(user);

    // Asignar roles
    await this.userRepository.assignRoles(createdUser.id, command.roleIds);

    // Actualizar roleIds en el objeto de retorno
    createdUser.assignRoles(command.roleIds);

    return createdUser;
  }
}
