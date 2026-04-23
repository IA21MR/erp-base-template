// Puerto del repositorio para refresh tokens
// Define las operaciones de persistencia para tokens de refresco

import { RefreshToken } from '../entities/RefreshToken.entity';

export interface RefreshTokenRepository {
  // Crear un nuevo refresh token
  create(
    userId: number,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken>;

  // Buscar un refresh token por el token string
  findByToken(token: string): Promise<RefreshToken | null>;

  // Buscar refresh tokens por userId
  findByUserId(userId: number): Promise<RefreshToken[]>;

  // Eliminar refresh tokens de un usuario (útil para logout)
  deleteByUserId(userId: number): Promise<void>;

  // Eliminar un refresh token específico por token string
  deleteByToken(token: string): Promise<void>;

  // Eliminar tokens expirados (limpieza periódica)
  deleteExpired(): Promise<void>;
}
