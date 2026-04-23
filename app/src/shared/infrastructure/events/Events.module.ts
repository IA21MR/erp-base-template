/**
 * EventsModule — wiring de Domain Events + Outbox Pattern (global).
 *
 * Provee:
 * - EventBus (adapter NestEventBus sobre EventEmitter2)
 * - OutboxRepository (Prisma)
 * - OutboxRelay (scheduled worker)
 * - AuditLogListener (demo)
 *
 * Es Global para que cualquier módulo pueda inyectar EVENT_BUS / OUTBOX_REPOSITORY.
 */
import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../../infrastructure/database/prisma/prisma.module';
import { EVENT_BUS } from '../../domain/events/EventBus.interface';
import { OUTBOX_REPOSITORY } from '../../domain/events/OutboxRepository.interface';
import { NestEventBus } from './NestEventBus';
import { PrismaOutboxRepository } from './PrismaOutboxRepository';
import { OutboxRelay } from './OutboxRelay.service';
import { AuditLogListener } from './AuditLogListener';

@Global()
@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 20,
      verboseMemoryLeak: false,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    { provide: EVENT_BUS, useClass: NestEventBus },
    { provide: OUTBOX_REPOSITORY, useClass: PrismaOutboxRepository },
    OutboxRelay,
    AuditLogListener,
  ],
  exports: [EVENT_BUS, OUTBOX_REPOSITORY],
})
export class EventsModule {}
