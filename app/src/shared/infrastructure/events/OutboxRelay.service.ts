/**
 * OutboxRelay — worker que despacha eventos pendientes del outbox al EventBus.
 *
 * - Se ejecuta en intervalos (cada 1s por defecto).
 * - Lee batch con `FOR UPDATE SKIP LOCKED` (seguro frente a múltiples instancias).
 * - Reconstruye un DomainEvent-like object (payload + metadata) y publica.
 * - En éxito → markProcessed. En fallo → markFailed (attempts++, lastError).
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { EVENT_BUS } from '../../domain/events/EventBus.interface';
import type { EventBus } from '../../domain/events/EventBus.interface';
import { OUTBOX_REPOSITORY } from '../../domain/events/OutboxRepository.interface';
import type {
  OutboxPendingRecord,
  OutboxRepository,
} from '../../domain/events/OutboxRepository.interface';

/**
 * Evento genérico reconstruido desde fila de outbox. Los listeners pueden
 * tipar su payload según el `eventType`.
 */
class OutboxReplayedEvent extends DomainEvent {
  constructor(rec: OutboxPendingRecord) {
    super(rec.aggregateId, rec.aggregateType, (rec.payload ?? {}) as object, rec.eventVersion);
    Object.defineProperty(this, 'eventId', { value: rec.id, writable: false });
    Object.defineProperty(this, 'occurredAt', { value: rec.occurredAt, writable: false });
    Object.defineProperty(this, '_eventTypeOverride', {
      value: rec.eventType,
      writable: false,
    });
  }
  override get eventType(): string {
    return (this as unknown as { _eventTypeOverride: string })._eventTypeOverride;
  }
}

@Injectable()
export class OutboxRelay {
  private readonly logger = new Logger(OutboxRelay.name);
  private readonly batchSize = 50;
  private running = false;

  constructor(
    @Inject(OUTBOX_REPOSITORY) private readonly outbox: OutboxRepository,
    @Inject(EVENT_BUS) private readonly eventBus: EventBus,
  ) {}

  @Interval('outbox-relay', 1000)
  async tick(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.processBatch();
    } catch (err) {
      this.logger.error('Error en OutboxRelay.tick', err instanceof Error ? err.stack : err);
    } finally {
      this.running = false;
    }
  }

  private async processBatch(): Promise<void> {
    const pending = await this.outbox.fetchPending(this.batchSize);
    if (pending.length === 0) return;

    const successIds: string[] = [];
    for (const rec of pending) {
      try {
        const event = new OutboxReplayedEvent(rec);
        await this.eventBus.publish(event);
        successIds.push(rec.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Fallo publicando evento ${rec.id} (${rec.eventType}): ${msg}`);
        await this.outbox.markFailed(rec.id, msg);
      }
    }
    if (successIds.length > 0) {
      await this.outbox.markProcessed(successIds);
    }
  }
}
