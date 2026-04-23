// Adaptador de Prisma para el repositorio de refresh tokens
// Implementación concreta del puerto RefreshTokenRepository

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma/prisma.service';
import { RefreshTokenRepository } from '../../domain/repositories/RefreshTokenRepository.interface';
import { RefreshToken } from '../../domain/entities/RefreshToken.entity';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    // Intentar hasta 3 veces para manejar race conditions
    let lastError: any;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Usar transacción para evitar race conditions:
        // Primero eliminar tokens existentes, luego crear el nuevo
        const refreshToken = await this.prisma.$transaction(async (tx) => {
          // Eliminar refresh tokens antiguos del usuario
          await tx.refreshToken.deleteMany({
            where: { userId },
          });

          // Pequeño delay para evitar race conditions en tests paralelos
          if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, 50 * attempt));
          }

          // Crear el nuevo refresh token
          return await tx.refreshToken.create({
            data: {
              userId,
              token,
              expiresAt,
            },
          });
        });

        return RefreshToken.create(
          refreshToken.id,
          refreshToken.userId,
          refreshToken.token,
          refreshToken.expiresAt,
          refreshToken.createdAt
        );
      } catch (error: any) {
        lastError = error;
        // Si es error de constraint único y no es el último intento, reintentar
        if (error.code === 'P2002' && attempt < 2) {
          continue;
        }
        // Si es otro error o último intento, lanzar
        throw error;
      }
    }

    throw lastError;
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) return null;

    return RefreshToken.create(
      refreshToken.id,
      refreshToken.userId,
      refreshToken.token,
      refreshToken.expiresAt,
      refreshToken.createdAt
    );
  }

  async findByUserId(userId: number): Promise<RefreshToken[]> {
    const refreshTokens = await this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return refreshTokens.map((rt) =>
      RefreshToken.create(rt.id, rt.userId, rt.token, rt.expiresAt, rt.createdAt)
    );
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
