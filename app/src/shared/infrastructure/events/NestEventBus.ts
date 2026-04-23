/**
 * NestEventBus — adapter de EventBus basado en @nestjs/event-emitter
 *
 * Publica cada `DomainEvent` usando `eventType` (nombre de la clase) como canal.
 * Los listeners se registran con `@OnEvent('OrganizationCreatedEvent')`.
 */
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { EventBus } from '../../domain/events/EventBus.interface';

@Injectable()
export class NestEventBus implements EventBus {
  constructor(private readonly emitter: EventEmitter2) {}

  publish(event: DomainEvent): void {
    this.emitter.emit(event.eventType, event);
  }

  publishAll(events: DomainEvent[]): void {
    for (const event of events) {
      this.publish(event);
    }
  }
}
