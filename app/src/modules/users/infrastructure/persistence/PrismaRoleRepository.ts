// Implementación del repositorio de Rol usando Prisma
// Adaptador de infraestructura que implementa el puerto del dominio

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { RoleRepository } from '../../domain/repositories/RoleRepository.interface';
import { Role } from '../../domain/entities/Role.entity';
import { calculateSkip } from '../../../../shared/utils/pagination.helper';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(role: Role): Promise<Role> {
    const created = await this.prisma.role.create({
      data: {
        name: role.name,
      },
    });

    return Role.create(created.id, created.name, role.permissionIds);
  }

  async findById(id: number): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: true,
      },
    });

    if (!role) return null;

    const permissionIds = role.rolePermissions.map((rp) => rp.permissionId);

    return Role.create(role.id, role.name, permissionIds);
  }

  async findByIds(ids: number[]): Promise<Role[]> {
    if (ids.length === 0) return [];

    const roles = await this.prisma.role.findMany({
      where: { id: { in: ids } },
      include: {
        rolePermissions: true,
      },
    });

    return roles.map((role) => {
      const permissionIds = role.rolePermissions.map((rp) => rp.permissionId);
      return Role.create(role.id, role.name, permissionIds);
    });
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: {
        rolePermissions: true,
      },
    });

    if (!role) return null;

    const permissionIds = role.rolePermissions.map((rp) => rp.permissionId);

    return Role.create(role.id, role.name, permissionIds);
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: true,
      },
    });

    return roles.map((role) => {
      const permissionIds = role.rolePermissions.map((rp) => rp.permissionId);
      return Role.create(role.id, role.name, permissionIds);
    });
  }

  async listPaginated(page: number, perPage: number): Promise<{
    items: Role[];
    total: number;
  }> {
    const skip = calculateSkip(page, perPage);

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: perPage,
        include: {
          rolePermissions: true,
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.role.count(),
    ]);

    const items = roles.map((role) => {
      const permissionIds = role.rolePermissions.map((rp) => rp.permissionId);
      return Role.create(role.id, role.name, permissionIds);
    });

    return { items, total };
  }

  async update(role: Role): Promise<Role> {
    const updated = await this.prisma.role.update({
      where: { id: role.id },
      data: {
        name: role.name,
      },
      include: {
        rolePermissions: true,
      },
    });

    const permissionIds = updated.rolePermissions.map((rp) => rp.permissionId);

    return Role.create(updated.id, updated.name, permissionIds);
  }

  async delete(id: number): Promise<void> {
    // Eliminar primero las relaciones en role_permission
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Ahora eliminar el rol
    await this.prisma.role.delete({
      where: { id },
    });
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.role.count({
      where: { name },
    });
    return count > 0;
  }

  async isAssignedToUser(roleId: number): Promise<boolean> {
    const count = await this.prisma.userRole.count({
      where: { roleId },
    });
    return count > 0;
  }

  async assignPermissions(
    roleId: number,
    permissionIds: number[]
  ): Promise<void> {
    // Eliminar permisos existentes
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Asignar nuevos permisos
    await this.prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
    });
  }

  async removePermissions(
    roleId: number,
    permissionIds: number[]
  ): Promise<void> {
    await this.prisma.rolePermission.deleteMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });
  }

  async getRolePermissions(roleId: number): Promise<number[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { roleId },
    });
    return rolePermissions.map((rp) => rp.permissionId);
  }

  async existsByNameAndPermissions(
    name: string,
    permissionIds: number[]
  ): Promise<boolean> {
    // Buscar rol con el mismo nombre
    const role = await this.prisma.role.findUnique({
      where: { name },
      include: {
        rolePermissions: true,
      },
    });

    if (!role) return false;

    // Verificar si tiene los mismos permisos
    const existingPermissionIds = role.rolePermissions
      .map((rp) => rp.permissionId)
      .sort();
    const newPermissionIds = [...permissionIds].sort();

    return (
      existingPermissionIds.length === newPermissionIds.length &&
      existingPermissionIds.every((id, index) => id === newPermissionIds[index])
    );
  }
}
