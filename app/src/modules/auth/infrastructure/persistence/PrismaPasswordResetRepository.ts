// Adaptador de Prisma para el repositorio de códigos de restablecimiento
// Implementación concreta del puerto PasswordResetRepository

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { PasswordResetRepository } from '../../domain/repositories/PasswordResetRepository.interface';
import { PasswordResetCode } from '../../domain/entities/PasswordResetCode.entity';

@Injectable()
export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    code: string,
    expiresAt: Date
  ): Promise<PasswordResetCode> {
    const resetCode = await this.prisma.passwordResetCode.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    });

    return PasswordResetCode.create(
      resetCode.id,
      resetCode.userId,
      resetCode.code,
      resetCode.expiresAt,
      resetCode.used,
      resetCode.createdAt
    );
  }

  async findByUserAndCode(
    userId: number,
    code: string
  ): Promise<PasswordResetCode | null> {
    const resetCode = await this.prisma.passwordResetCode.findFirst({
      where: {
        userId,
        code,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!resetCode) return null;

    return PasswordResetCode.create(
      resetCode.id,
      resetCode.userId,
      resetCode.code,
      resetCode.expiresAt,
      resetCode.used,
      resetCode.createdAt
    );
  }

  async markAsUsed(id: number): Promise<void> {
    await this.prisma.passwordResetCode.update({
      where: { id },
      data: { used: true },
    });
  }

  async deleteOldCodes(userId: number): Promise<void> {
    await this.prisma.passwordResetCode.deleteMany({
      where: { userId },
    });
  }

  async findLatestByUser(userId: number): Promise<PasswordResetCode | null> {
    const resetCode = await this.prisma.passwordResetCode.findFirst({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!resetCode) return null;

    return PasswordResetCode.create(
      resetCode.id,
      resetCode.userId,
      resetCode.code,
      resetCode.expiresAt,
      resetCode.used,
      resetCode.createdAt
    );
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.passwordResetCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { used: true },
        ],
      },
    });
  }
}
