/**
 * DomainEvent — shared/domain
 *
 * Base para todos los eventos de dominio. Los aggregates añaden instancias concretas
 * que luego el use case persiste en outbox (dentro de la misma transacción que el aggregate).
 *
 * Campos:
 * - eventId: UUID v7 único por evento (generado al crear).
 * - aggregateId: id del aggregate que emite el evento.
 * - aggregateType: nombre del aggregate (ej: 'Organization').
 * - eventType: nombre de la clase concreta (ej: 'OrganizationCreatedEvent').
 * - eventVersion: versión del schema del payload (para migraciones futuras).
 * - occurredAt: timestamp.
 * - payload: datos serializables del evento.
 */
import { uuidv7 } from 'uuidv7';

export abstract class DomainEvent<P extends object = object> {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  constructor(
    public readonly aggregateId: string,
    public readonly aggregateType: string,
    public readonly payload: P,
    public readonly eventVersion: number = 1,
  ) {
    this.eventId = uuidv7();
    this.occurredAt = new Date();
  }

  /**
   * Nombre del evento (nombre de la clase concreta). Usado como discriminator.
   */
  get eventType(): string {
    return this.constructor.name;
  }
}
