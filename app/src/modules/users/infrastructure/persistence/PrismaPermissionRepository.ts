// Implementación del repositorio de Permiso usando Prisma
// Adaptador de infraestructura que implementa el puerto del dominio

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { PermissionRepository } from '../../domain/repositories/PermissionRepository.interface';
import { Permission } from '../../domain/entities/Permission.entity';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) return null;

    return Permission.create(
      permission.id,
      permission.code,
      permission.description ?? ''
    );
  }

  async findByCode(code: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { code },
    });

    if (!permission) return null;

    return Permission.create(
      permission.id,
      permission.code,
      permission.description ?? ''
    );
  }

  async findByIds(ids: number[]): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: ids },
      },
    });

    return permissions.map((p) =>
      Permission.create(p.id, p.code, p.description ?? '')
    );
  }

  async findByCodes(codes: string[]): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        code: { in: codes },
      },
    });

    return permissions.map((p) =>
      Permission.create(p.id, p.code, p.description ?? '')
    );
  }

  async findAll(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany();

    return permissions.map((p) =>
      Permission.create(p.id, p.code, p.description)
    );
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.permission.count({
      where: { code },
    });
    return count > 0;
  }
}
