// Caso de uso: Buscar Usuarios (RF-U2)
// El sistema debe permitir buscar usuarios por nombre, email, estado y rol

import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User.entity';
import { Role } from '../../domain/entities/Role.entity';
import type { UserRepository } from '../../domain/repositories/UserRepository.interface';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import { SearchUsersCommand } from '../commands/SearchUsersCommand';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '../../Users.Tokens';
import { computeTotalPages } from '../../../../shared/domain/Pagination';

export interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  active: boolean;
  roles: Role[];
}

export interface SearchUsersResult {
  items: UserSearchResult[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

@Injectable()
export class SearchUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(command: SearchUsersCommand): Promise<SearchUsersResult> {
    const page = command.page ?? 1;
    const perPage = command.perPage ?? 30;

    // Buscar usuarios con filtros y paginación
    const result = await this.userRepository.search(
      command.query,
      command.active,
      command.roleId,
      page,
      perPage,
      command.organizationId,
    );

    // Batch: obtener todos los roleIds únicos
    const allRoleIds = [...new Set(result.items.flatMap((user) => user.roleIds))];
    const roles = await this.roleRepository.findByIds(allRoleIds);
    const rolesMap = new Map(roles.map((role) => [role.id, role]));

    // Mapear usuarios con sus roles
    const usersWithRoles: UserSearchResult[] = result.items.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email.value,
      active: user.active,
      roles: user.roleIds
        .map((roleId) => rolesMap.get(roleId))
        .filter((role): role is Role => role !== undefined),
    }));

    return {
      items: usersWithRoles,
      meta: {
        total: result.total,
        page,
        perPage,
        totalPages: computeTotalPages(result.total, perPage),
      },
    };
  }
}
