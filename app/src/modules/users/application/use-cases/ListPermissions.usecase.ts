// Caso de uso: Listar Permisos
// Obtener todos los permisos disponibles en el sistema

import { Inject, Injectable } from '@nestjs/common';
import { Permission } from '../../domain/entities/Permission.entity';
import type { PermissionRepository } from '../../domain/repositories/PermissionRepository.interface';
import { PERMISSION_REPOSITORY } from '../../Users.Tokens';

@Injectable()
export class ListPermissionsUseCase {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(): Promise<Permission[]> {
    return await this.permissionRepository.findAll();
  }
}
