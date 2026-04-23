/**
 * AuditLogListener — demo listener para validar el wiring end-to-end del outbox.
 *
 * Registra en el log cada evento publicado. En producción se reemplaza por listeners
 * específicos por módulo (auditoría, notificaciones, integraciones).
 */
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvent } from '../../../shared/domain/events/DomainEvent';

@Injectable()
export class AuditLogListener {
  private readonly logger = new Logger(AuditLogListener.name);

  /**
   * Wildcard listener: captura todos los eventos.
   * Requiere `wildcard: true` en EventEmitterModule.forRoot().
   */
  @OnEvent('**', { async: true })
  handle(event: DomainEvent): void {
    if (!event || typeof event !== 'object') return;
    this.logger.log(
      `[audit] ${event.eventType} aggregateType=${event.aggregateType} aggregateId=${event.aggregateId} eventId=${event.eventId}`,
    );
  }
}
