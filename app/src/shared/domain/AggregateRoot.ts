/**
 * AggregateRoot — shared/domain
 *
 * Clase base para aggregate roots. Mantiene una lista interna de eventos de dominio
 * pendientes que el use case extrae (`pullDomainEvents`) para persistir en outbox.
 */
import { DomainEvent } from './events/DomainEvent';

export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Devuelve los eventos pendientes y los limpia del aggregate.
   * Llamar después de persistir para asegurar que se escriben en outbox en la misma TX.
   */
  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  clearDomainEvents(): void {
    this._domainEvents = [];
  }

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }
}
