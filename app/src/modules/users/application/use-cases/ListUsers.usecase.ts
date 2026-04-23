// Caso de uso: Listar Usuarios con paginación (RF-U2)
// El sistema debe permitir visualizar la lista de todos los usuarios con su estado y roles

import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/User.entity';
import { Role } from '../../domain/entities/Role.entity';
import type { UserRepository } from '../../domain/repositories/UserRepository.interface';
import type { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '../../Users.Tokens';
import { computeTotalPages } from '../../../../shared/domain/Pagination';

export interface UserWithRoles {
  id: number;
  name: string;
  email: string;
  active: boolean;
  roles: Role[];
}

export interface ListUsersCommand {
  page: number;
  perPage: number;
  organizationId?: string; // Filtro multi-tenant
}

export interface ListUsersResult {
  items: UserWithRoles[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository
  ) {}

  async execute(command: ListUsersCommand): Promise<ListUsersResult> {
    const page = command.page ?? 1;
    const perPage = command.perPage ?? 30;

    // Obtener usuarios paginados (filtrados por tenant si corresponde)
    const result = await this.userRepository.listPaginated(
      page,
      perPage,
      command.organizationId,
    );

    // Obtener todos los roleIds únicos de los usuarios
    const allRoleIds = [...new Set(result.items.flatMap((user) => user.roleIds))];

    // Batch: obtener todos los roles en una sola query
    const roles = await this.roleRepository.findByIds(allRoleIds);
    const rolesMap = new Map(roles.map((role) => [role.id, role]));

    // Mapear usuarios con sus roles
    const usersWithRoles: UserWithRoles[] = result.items.map((user) => ({
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
