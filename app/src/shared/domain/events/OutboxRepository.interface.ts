/**
 * OutboxRepository — port de dominio
 *
 * Persiste eventos de dominio en la tabla `outbox_event` dentro de la misma transacción
 * que el aggregate. El `OutboxRelay` worker los consume asíncronamente y publica al EventBus.
 */
import { DomainEvent } from './DomainEvent';
import { PrismaTransactionClient } from '../../database/transaction-manager';

export interface OutboxPendingRecord {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventVersion: number;
  payload: unknown;
  occurredAt: Date;
  attempts: number;
}

export interface OutboxRepository {
  /**
   * Persiste eventos pendientes en la misma transacción del aggregate.
   */
  saveAll(events: DomainEvent[], tx: PrismaTransactionClient): Promise<void>;

  /**
   * Obtiene un lote de eventos pendientes (con lock FOR UPDATE SKIP LOCKED).
   */
  fetchPending(limit: number): Promise<OutboxPendingRecord[]>;

  markProcessed(ids: string[]): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}

export const OUTBOX_REPOSITORY = Symbol('OUTBOX_REPOSITORY');
