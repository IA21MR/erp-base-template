/**
 * TransactionManager — Shared Infrastructure
 *
 * Envuelve operaciones multi-paso en transacciones Prisma interactivas.
 * Uso: inyectar en use cases que necesiten atomicidad (pagos, anulaciones, etc.)
 *
 * @example
 *   await this.txManager.run(async (tx) => {
 *     await repo.save(entity, tx);
 *     await otherRepo.update(id, data, tx);
 *   });
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { PrismaClient } from '@prisma/client';

/**
 * Tipo que representa el cliente transaccional de Prisma.
 * Los repositorios pueden aceptar este tipo como parámetro opcional
 * para operar dentro de una transacción.
 */
export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class TransactionManager {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ejecuta `fn` dentro de una transacción interactiva.
   * Si `fn` lanza un error, Prisma revierte automáticamente todos los cambios.
   */
  async run<T>(
    fn: (tx: PrismaTransactionClient) => Promise<T>,
    options?: { maxWait?: number; timeout?: number },
  ): Promise<T> {
    return this.prisma.$transaction(fn, {
      maxWait: options?.maxWait ?? 5000,
      timeout: options?.timeout ?? 15000,
    });
  }
}
