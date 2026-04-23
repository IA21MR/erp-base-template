// Implementación del repositorio de Usuario usando Prisma
// Adaptador de infraestructura que implementa el puerto del dominio.
//
// Multi-tenant: la columna `organizationId` en DB representa el `tenantId`
// del agregado. La entidad de dominio NO conoce el módulo `organizations`;
// usa el VO `TenantId` (shared/domain).

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { UserRepository } from '../../domain/repositories/UserRepository.interface';
import { User } from '../../domain/entities/User.entity';
import { calculateSkip } from '../../../../shared/utils/pagination.helper';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        organizationId: user.tenantId?.value ?? null,
        name: user.name,
        email: user.email.value,
        passwordHash: user.passwordHash,
        active: user.active,
      },
    });

    return User.create(
      created.id,
      created.organizationId,
      created.name,
      created.email,
      created.passwordHash,
      created.active,
      []
    );
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: true },
    });

    if (!user) return null;

    const roleIds = user.userRoles.map((ur) => ur.roleId);

    return User.create(
      user.id,
      user.organizationId,
      user.name,
      user.email,
      user.passwordHash,
      user.active,
      roleIds,
      user.failedLoginAttempts,
      user.lockedUntil,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: true },
    });

    if (!user) return null;

    const roleIds = user.userRoles.map((ur) => ur.roleId);

    return User.create(
      user.id,
      user.organizationId,
      user.name,
      user.email,
      user.passwordHash,
      user.active,
      roleIds,
      user.failedLoginAttempts,
      user.lockedUntil,
    );
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: { userRoles: true },
    });

    return users.map((user) => {
      const roleIds = user.userRoles.map((ur) => ur.roleId);
      return User.create(
        user.id,
        user.organizationId,
        user.name,
        user.email,
        user.passwordHash,
        user.active,
        roleIds
      );
    });
  }

  async listPaginated(
    page: number,
    perPage: number,
    tenantId?: string | null,
  ): Promise<{ items: User[]; total: number }> {
    const skip = calculateSkip(page, perPage);
    // Filtro multi-tenant: si viene tenantId, se restringe al tenant del caller.
    const where = tenantId ? { organizationId: tenantId } : undefined;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: perPage,
        include: { userRoles: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const items = users.map((user) => {
      const roleIds = user.userRoles.map((ur) => ur.roleId);
      return User.create(
        user.id,
        user.organizationId,
        user.name,
        user.email,
        user.passwordHash,
        user.active,
        roleIds
      );
    });

    return { items, total };
  }

  async search(
    query?: string,
    active?: boolean,
    roleId?: number,
    page: number = 1,
    perPage: number = 30,
    tenantId?: string | null,
  ): Promise<{ items: User[]; total: number }> {
    const where: any = {};

    // Filtro multi-tenant
    if (tenantId) {
      where.organizationId = tenantId;
    }

    if (active !== undefined) {
      where.active = active;
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (roleId) {
      where.userRoles = { some: { roleId } };
    }

    const skip = calculateSkip(page, perPage);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: perPage,
        include: { userRoles: true },
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const items = users.map((user) => {
      const roleIds = user.userRoles.map((ur) => ur.roleId);
      return User.create(
        user.id,
        user.organizationId,
        user.name,
        user.email,
        user.passwordHash,
        user.active,
        roleIds
      );
    });

    return { items, total };
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email.value,
        passwordHash: user.passwordHash,
        active: user.active,
      },
      include: { userRoles: true },
    });

    const roleIds = updated.userRoles.map((ur) => ur.roleId);

    return User.create(
      updated.id,
      updated.organizationId,
      updated.name,
      updated.email,
      updated.passwordHash,
      updated.active,
      roleIds
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async assignRoles(userId: number, roleIds: number[]): Promise<void> {
    await this.prisma.userRole.deleteMany({ where: { userId } });
    await this.prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({ userId, roleId })),
    });
  }

  async removeRoles(userId: number, roleIds: number[]): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: { userId, roleId: { in: roleIds } },
    });
  }

  async getUserRoles(userId: number): Promise<number[]> {
    const userRoles = await this.prisma.userRole.findMany({ where: { userId } });
    return userRoles.map((ur) => ur.roleId);
  }

  async updateLoginAttempts(
    userId: number,
    failedLoginAttempts: number,
    lockedUntil: Date | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts, lockedUntil },
    });
  }
}
