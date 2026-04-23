import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { clearRateLimitCleanup } from '../src/infrastructure/guards/CustomThrottlerGuard';
import { DomainExceptionFilter } from '../src/infrastructure/filters';

describe('Permissions E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;

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

    // Login para obtener token de admin
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@sotek.com',
        password: 'admin123',
      })
      .expect(200);

    accessToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    clearRateLimitCleanup();
    await app.close();
  });

  describe('GET /permissions', () => {
    it('debería listar todos los permisos disponibles', async () => {
      const response = await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Permisos obtenidos exitosamente');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('debería verificar estructura de respuesta (id, code, description)', async () => {
      const response = await request(app.getHttpServer())
        .get('/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const firstPermission = response.body.data[0];
      expect(firstPermission).toHaveProperty('id');
      expect(firstPermission).toHaveProperty('code');
      expect(firstPermission).toHaveProperty('description');
      expect(typeof firstPermission.id).toBe('number');
      expect(typeof firstPermission.code).toBe('string');
    });

    it('debería rechazar sin autenticación (401)', () => {
      return request(app.getHttpServer()).get('/permissions').expect(401);
    });
  });
});
