/**
 * Filtro Global de Excepciones de Dominio
 *
 * Intercepta excepciones de la capa de dominio y las traduce
 * a respuestas HTTP con el código de estado apropiado.
 *
 * Ubicación: infrastructure/ (compartido por todos los módulos)
 *
 * Mapeo de excepciones:
 * - *NotFoundException    → 404 Not Found
 * - *DuplicateException   → 409 Conflict
 * - *InvalidException     → 400 Bad Request
 * - *HasRelationsException → 409 Conflict
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Mapeo de patrones de nombre de excepción a códigos HTTP
// IMPORTANTE: Los patrones más específicos deben ir primero
const EXCEPTION_STATUS_MAP: Record<string, HttpStatus> = {
  // Autenticación y autorización
  AccountLocked: HttpStatus.TOO_MANY_REQUESTS, // 429 - Bloqueo por intentos fallidos
  Credentials: HttpStatus.UNAUTHORIZED, // 401 - InvalidCredentials
  RefreshToken: HttpStatus.UNAUTHORIZED, // 401 - InvalidRefreshToken, ExpiredRefreshToken
  InactiveUser: HttpStatus.FORBIDDEN, // 403 - Usuario inactivo
  SelfDeactivation: HttpStatus.FORBIDDEN, // 403 - No puede desactivarse a sí mismo
  AdminDeactivation: HttpStatus.FORBIDDEN, // 403 - Admin no puede desactivar a otro admin
  
  // Errores de recursos
  NotFound: HttpStatus.NOT_FOUND, // 404
  Duplicate: HttpStatus.CONFLICT, // 409
  HasRelations: HttpStatus.CONFLICT, // 409
  HasUsers: HttpStatus.CONFLICT, // 409 - RoleHasUsersException
  AlreadyActive: HttpStatus.CONFLICT, // 409 - UserAlreadyActiveException
  AlreadyInactive: HttpStatus.CONFLICT, // 409 - UserAlreadyInactiveException
  AlreadyExists: HttpStatus.CONFLICT, // 409
  
  // Errores de validación
  Incoherent: HttpStatus.BAD_REQUEST, // 400 - IncoherentPermissionsException
  Invalid: HttpStatus.BAD_REQUEST, // 400
  Validation: HttpStatus.BAD_REQUEST, // 400
  Required: HttpStatus.BAD_REQUEST, // 400
  Expired: HttpStatus.BAD_REQUEST, // 400 - ExpiredResetCode
  Used: HttpStatus.BAD_REQUEST, // 400 - UsedResetCode
  WeakPassword: HttpStatus.BAD_REQUEST, // 400
  Mismatch: HttpStatus.BAD_REQUEST, // 400 - PasswordMismatch
  
  // Errores de servicio
  EmailSending: HttpStatus.SERVICE_UNAVAILABLE, // 503
};

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Si ya es una HttpException de NestJS, dejar que NestJS la maneje
    if (this.isNestHttpException(exception)) {
      const status = (exception as any).getStatus();
      const exceptionResponse = (exception as any).getResponse();

      response.status(status).json(
        typeof exceptionResponse === 'string'
          ? { statusCode: status, message: exceptionResponse }
          : exceptionResponse,
      );
      return;
    }

    // Procesar excepciones de dominio personalizadas
    if (exception instanceof Error) {
      const status = this.getStatusFromExceptionName(exception.name);
      const message = exception.message;

      // Log para debugging (solo si es 500)
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `Unhandled exception: ${exception.name}`,
          exception.stack,
        );
      } else {
        this.logger.warn(
          `Domain exception: ${exception.name} - ${message} [${request.method} ${request.url}]`,
        );
      }

      response.status(status).json({
        statusCode: status,
        message: message,
        error: this.getErrorName(status),
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    // Fallback para errores desconocidos
    this.logger.error('Unknown error type', exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  /**
   * Determina el código HTTP basado en el nombre de la excepción
   */
  private getStatusFromExceptionName(exceptionName: string): HttpStatus {
    for (const [pattern, status] of Object.entries(EXCEPTION_STATUS_MAP)) {
      if (exceptionName.includes(pattern)) {
        return status;
      }
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Verifica si es una HttpException de NestJS
   */
  private isNestHttpException(exception: unknown): boolean {
    return (
      exception !== null &&
      typeof exception === 'object' &&
      'getStatus' in exception &&
      'getResponse' in exception
    );
  }

  /**
   * Obtiene el nombre del error HTTP
   */
  private getErrorName(status: HttpStatus): string {
    const names: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    };
    return names[status] || 'Error';
  }
}
