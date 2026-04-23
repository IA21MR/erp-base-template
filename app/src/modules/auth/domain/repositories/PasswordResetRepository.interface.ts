// Puerto (Interface) del repositorio de códigos de restablecimiento de contraseña
// Define las operaciones que el dominio necesita para gestionar códigos de restablecimiento

import { PasswordResetCode } from '../entities/PasswordResetCode.entity';

export interface PasswordResetRepository {
  /**
   * Crea un nuevo código de restablecimiento para un usuario
   * @param userId - ID del usuario
   * @param code - Código de 6 dígitos
   * @param expiresAt - Fecha de expiración
   * @returns Promise<PasswordResetCode> - Código creado
   */
  create(
    userId: number,
    code: string,
    expiresAt: Date
  ): Promise<PasswordResetCode>;

  /**
   * Busca un código de restablecimiento por usuario y código
   * @param userId - ID del usuario
   * @param code - Código de 6 dígitos
   * @returns Promise<PasswordResetCode | null> - Código encontrado o null
   */
  findByUserAndCode(
    userId: number,
    code: string
  ): Promise<PasswordResetCode | null>;

  /**
   * Marca un código como usado (no puede volver a usarse)
   * @param id - ID del código
   * @returns Promise<void>
   */
  markAsUsed(id: number): Promise<void>;

  /**
   * Elimina códigos antiguos de un usuario (cuando se genera uno nuevo)
   * @param userId - ID del usuario
   * @returns Promise<void>
   */
  deleteOldCodes(userId: number): Promise<void>;

  /**
   * Busca el último código válido de un usuario
   * @param userId - ID del usuario
   * @returns Promise<PasswordResetCode | null> - Último código o null
   */
  findLatestByUser(userId: number): Promise<PasswordResetCode | null>;

  /**
   * Elimina códigos expirados o usados (limpieza periódica)
   * @returns Promise<void>
   */
  deleteExpired(): Promise<void>;
}
