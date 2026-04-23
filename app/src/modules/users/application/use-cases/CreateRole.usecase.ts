// Caso de uso: Crear Rol (RF-R3)
// El sistema debe permitir crear nuevos roles asignándoles un nombre y permisos

import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../domain/entities/Role.entity';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import type { PermissionRepository } from '../../domain/repositories/PermissionRepository.interface';
import { CreateRoleCommand } from '../commands/CreateRoleCommand';
import {
  InvalidRoleDataException,
  DuplicateRoleException,
  PermissionNotFoundException,
  IncoherentPermissionsException,
} from '../../domain/exceptions';
import { validatePermissionCoherence } from '../../domain/rules';
import { ROLE_REPOSITORY, PERMISSION_REPOSITORY } from '../../Users.Tokens';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(command: CreateRoleCommand): Promise<Role> {
    // Validar que el nombre no esté vacío
    if (!command.name || command.name.trim().length === 0) {
      throw new InvalidRoleDataException('El nombre del rol no puede estar vacío');
    }

    // Validar que no exista un rol con el mismo nombre
    const existingRole = await this.roleRepository.findByName(command.name);
    if (existingRole) {
      throw new DuplicateRoleException(command.name);
    }

    // Validar permisos
    if (!command.permissionIds || command.permissionIds.length === 0) {
      throw new InvalidRoleDataException('Debe asignar al menos un permiso al rol');
    }

    // Verificar que todos los permisos existan
    const permissions = await this.permissionRepository.findByIds(
      command.permissionIds
    );
    if (permissions.length !== command.permissionIds.length) {
      throw new PermissionNotFoundException(command.permissionIds);
    }

    // Validar coherencia de permisos (regla de dominio: acción requiere lectura base)
    const permissionCodes = permissions.map((p) => p.code);
    const coherenceErrors = validatePermissionCoherence(permissionCodes);
    if (coherenceErrors.length > 0) {
      throw new IncoherentPermissionsException(coherenceErrors);
    }

    // RF-R3: Validar que no exista un rol con el mismo nombre y permisos
    const duplicateExists =
      await this.roleRepository.existsByNameAndPermissions(
        command.name,
        command.permissionIds
      );
    if (duplicateExists) {
      throw new DuplicateRoleException(command.name);
    }

    // Crear rol
    const role = Role.create(
      0, // ID temporal, se asignará en la BD
      command.name,
      command.permissionIds
    );

    // Persistir rol
    const createdRole = await this.roleRepository.create(role);

    // Asignar permisos
    await this.roleRepository.assignPermissions(
      createdRole.id,
      command.permissionIds
    );

    return createdRole;
  }
}
