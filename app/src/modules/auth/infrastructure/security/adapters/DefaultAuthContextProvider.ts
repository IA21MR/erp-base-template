/**
 * Adaptador por defecto de `AuthContextProvider`.
 *
 * Fuente de verdad multi-tenant: la columna `user.organization_id`.
 * Con la relación User ↔ Organization (1:N) establecida en el modelo,
 * la organización del usuario se lee directamente de su entidad.
 *
 * Los nombres de roles se leen del `RoleRepository` a partir de los roleIds
 * del usuario.
 */
import { Inject, Injectable } from '@nestjs/common';
import { AuthContextProvider } from '../../../application/ports/AuthContextProvider.interface';
import { ROLE_REPOSITORY, USER_REPOSITORY } from '../../../../users/Users.Tokens';
import type { RoleRepository } from '../../../../users/domain/repositories/RoleRepository.interface';
import type { UserRepository } from '../../../../users/domain/repositories/UserRepository.interface';

@Injectable()
export class DefaultAuthContextProvider implements AuthContextProvider {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async resolveOrganizationIdForUser(userId: number): Promise<string | null> {
    const user = await this.userRepository.findById(userId);
    return user ? user.tenantId?.value ?? null : null;
  }

  async resolveRoleNamesForUser(userId: number): Promise<string[]> {
    const roleIds = await this.userRepository.getUserRoles(userId);
    if (roleIds.length === 0) return [];
    const roles = await this.roleRepository.findByIds(roleIds);
    return roles.map((r) => r.name);
  }
}
