import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { clearRateLimitCleanup } from '../src/infrastructure/guards/CustomThrottlerGuard';
import { DomainExceptionFilter } from '../src/infrastructure/filters';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    // Configurar variable de entorno para tests
    process.env.NODE_ENV = 'test';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    clearRateLimitCleanup();
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('debería validar el formato del email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'email-invalido', password: 'Test123!' })
        .expect(400);
    });

    it('debería rechazar credenciales inválidas', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@sotek.com', password: 'Wrong' })
        .expect(401);
    });

    // Multi-tenant: el JWT debe incluir organizationId (string UUID v7)
    it('debería emitir JWT con organizationId del usuario', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@sotek.com', password: 'admin123' })
        .expect(200);

      const token: string = response.body.data.access_token;
      expect(token).toBeDefined();

      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(
        Buffer.from(payloadB64, 'base64').toString('utf8'),
      );

      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('email', 'admin@sotek.com');
      expect(payload).toHaveProperty('organizationId');
      expect(typeof payload.organizationId).toBe('string');
      expect(payload.organizationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(Array.isArray(payload.roles)).toBe(true);
      expect(Array.isArray(payload.permissions)).toBe(true);
    });
  });

  describe('GET /auth/me', () => {
    it('debería rechazar sin token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('debería rechazar con token inválido', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer token-invalido')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('debería rechazar refresh token inválido', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'token-invalido' })
        .expect(401);
    });

    it('debería requerir refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('debería responder con 200 (aunque el email no exista por seguridad)', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'noexiste@test.com' })
        .expect(200);
    });

    it('debería validar formato de email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'email-invalido' })
        .expect(400);
    });
  });

  describe('POST /auth/logout', () => {
    it('debería rechazar sin autenticación', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });
  });

  describe('Rate Limiting', () => {
    it('debería bloquear tras 5 intentos', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' });
      }
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrong' })
        .expect(429);
    });
  });
});

