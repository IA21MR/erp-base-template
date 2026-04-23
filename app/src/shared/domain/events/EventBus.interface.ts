/**
 * EventBus — port de dominio
 *
 * Puerto abstracto para publicar eventos tras su persistencia en outbox.
 * El adapter default usa `@nestjs/event-emitter` (in-process); se puede
 * reemplazar por RabbitMQ/Kafka sin cambiar el dominio.
 */
import { DomainEvent } from './DomainEvent';

export interface EventBus {
  publish(event: DomainEvent): Promise<void> | void;
  publishAll(events: DomainEvent[]): Promise<void> | void;
}

export const EVENT_BUS = Symbol('EVENT_BUS');
