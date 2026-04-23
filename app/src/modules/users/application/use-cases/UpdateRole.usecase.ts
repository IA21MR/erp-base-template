// Caso de uso: Actualizar Rol (RF-R3)
// El sistema debe permitir editar roles existentes, modificando su nombre y permisos

import { Inject, Injectable } from '@nestjs/common';
import { Role } from '../../domain/entities/Role.entity';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import type { PermissionRepository } from '../../domain/repositories/PermissionRepository.interface';
import { UpdateRoleCommand } from '../commands/UpdateRoleCommand';
import {
  RoleNotFoundException,
  DuplicateRoleException,
  InvalidRoleDataException,
  PermissionNotFoundException,
  IncoherentPermissionsException,
} from '../../domain/exceptions';
import { validatePermissionCoherence } from '../../domain/rules';
import { ROLE_REPOSITORY, PERMISSION_REPOSITORY } from '../../Users.Tokens';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(roleId: number, command: UpdateRoleCommand): Promise<Role> {
    // Buscar rol
    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new RoleNotFoundException(roleId);
    }

    // Actualizar nombre si se proporciona
    if (command.name) {
      // Validar que no exista otro rol con el mismo nombre
      const existingRole = await this.roleRepository.findByName(command.name);
      if (existingRole && existingRole.id !== roleId) {
        throw new DuplicateRoleException(command.name);
      }

      role.updateName(command.name);
    }

    // Actualizar permisos si se proporcionan
    if (command.permissionIds) {
      if (command.permissionIds.length === 0) {
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

      role.assignPermissions(command.permissionIds);

      // Actualizar permisos en la BD
      await this.roleRepository.assignPermissions(roleId, command.permissionIds);
    }

    // RF-R3: Validar que no exista otro rol con el mismo nombre y permisos
    const finalName = command.name || role.name;
    const finalPermissions = command.permissionIds || role.permissionIds;

    const duplicateExists =
      await this.roleRepository.existsByNameAndPermissions(
        finalName,
        finalPermissions
      );
    if (duplicateExists) {
      const existingDuplicate = await this.roleRepository.findByName(finalName);
      if (existingDuplicate && existingDuplicate.id !== roleId) {
        throw new DuplicateRoleException(finalName);
      }
    }

    // Persistir cambios
    const updatedRole = await this.roleRepository.update(role);

    return updatedRole;
  }
}
