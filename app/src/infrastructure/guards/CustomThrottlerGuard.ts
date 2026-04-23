// Rate Limiting Guard Manual
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const requestStore = new Map();

export const RATE_LIMIT_KEY = 'rateLimit';

export const RateLimit = (limit, ttl = 60000) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, ttl });

export const SkipRateLimit = () => SetMetadata(RATE_LIMIT_KEY, { skip: true });

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  private readonly defaultLimit = parseInt(process.env.RATE_LIMIT_MAX || '100');
  private readonly defaultTtl = parseInt(process.env.RATE_LIMIT_TTL || '60000');

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const rateLimitStatic: any = this.reflector.getAllAndOverride(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);
    if (rateLimitStatic?.skip) return true;
    const limit: number = rateLimitStatic?.limit ?? this.defaultLimit;
    const ttl: number = rateLimitStatic?.ttl ?? this.defaultTtl;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const route = request.route?.path || request.url;
    const key = ip + ':' + route;
    const now = Date.now();
    const record: any = requestStore.get(key);
    if (!record || now > record.resetTime) {
      requestStore.set(key, { count: 1, resetTime: now + ttl });
      return true;
    }
    record.count++;
    if (record.count > limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      throw new HttpException({ statusCode: HttpStatus.TOO_MANY_REQUESTS, message: 'Has excedido el limite de ' + limit + ' peticiones. Intenta de nuevo en ' + retryAfter + ' segundos.', error: 'Too Many Requests' }, HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}

let cleanupInterval: NodeJS.Timeout | undefined;
if (process.env.NODE_ENV !== 'test') {
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestStore.entries() as any) {
      if (now > record.resetTime) requestStore.delete(key);
    }
  }, 5 * 60 * 1000);
  cleanupInterval.unref();
}

export const clearRateLimitCleanup = () => {
  if (cleanupInterval) { clearInterval(cleanupInterval); cleanupInterval = undefined; }
  requestStore.clear();
};
