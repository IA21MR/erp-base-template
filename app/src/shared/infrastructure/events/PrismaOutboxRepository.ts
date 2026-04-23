/**
 * PrismaOutboxRepository
 *
 * Implementación Prisma del puerto `OutboxRepository`.
 * - saveAll: persiste dentro de la transacción del aggregate (mismo tx handle).
 * - fetchPending: lee batch con lock pesimista para permitir múltiples relays.
 */
import { Injectable } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { DomainEvent } from '../../domain/events/DomainEvent';
import {
  OutboxPendingRecord,
  OutboxRepository,
} from '../../domain/events/OutboxRepository.interface';
import { PrismaTransactionClient } from '../../database/transaction-manager';

interface OutboxRow {
  id: string;
  aggregate_id: string;
  aggregate_type: string;
  event_type: string;
  event_version: number;
  payload: unknown;
  occurred_at: Date;
  attempts: number;
}

@Injectable()
export class PrismaOutboxRepository implements OutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  async saveAll(events: DomainEvent[], tx: PrismaTransactionClient): Promise<void> {
    if (events.length === 0) return;
    await tx.outboxEvent.createMany({
      data: events.map((e) => ({
        id: uuidv7(),
        aggregateId: e.aggregateId,
        aggregateType: e.aggregateType,
        eventType: e.eventType,
        eventVersion: e.eventVersion,
        payload: e.payload as object,
        occurredAt: e.occurredAt,
      })),
    });
  }

  /**
   * Obtiene un lote con FOR UPDATE SKIP LOCKED — permite múltiples workers
   * sin procesar el mismo evento dos veces.
   */
  async fetchPending(limit: number): Promise<OutboxPendingRecord[]> {
    const rows = await this.prisma.$queryRawUnsafe<OutboxRow[]>(
      `SELECT id, aggregate_id, aggregate_type, event_type, event_version, payload, occurred_at, attempts
       FROM outbox_event
       WHERE processed_at IS NULL
       ORDER BY occurred_at ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      limit,
    );
    return rows.map((r) => ({
      id: r.id,
      aggregateId: r.aggregate_id,
      aggregateType: r.aggregate_type,
      eventType: r.event_type,
      eventVersion: r.event_version,
      payload: r.payload,
      occurredAt: r.occurred_at,
      attempts: r.attempts,
    }));
  }

  async markProcessed(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.prisma.outboxEvent.updateMany({
      where: { id: { in: ids } },
      data: { processedAt: new Date() },
    });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        lastError: error.slice(0, 1000),
      },
    });
  }
}
