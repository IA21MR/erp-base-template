/**
 * E2E tests del módulo Organizations.
 *
 * Cubre endpoints REST + verifica que la pipeline Outbox funcione
 * (evento queda persistido y procesado).
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { clearRateLimitCleanup } from '../src/infrastructure/guards/CustomThrottlerGuard';
import { DomainExceptionFilter } from '../src/infrastructure/filters';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';

describe('Organizations E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let createdOrgId: string;
  let uniqueTaxId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    uniqueTaxId = `99${Date.now()}`;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    prisma = moduleFixture.get(PrismaService);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@sistema.com', password: 'admin123' });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
    }
    accessToken = loginResponse.body.data.access_token;
  });

  afterAll(async () => {
    clearRateLimitCleanup();
    await app.close();
  });

  // ==================== POST /organizations ====================
  describe('POST /organizations', () => {
    it('debería crear una organización', async () => {
      const response = await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          legalName: 'Empresa Test SpA',
          tradeName: 'Test',
          taxId: uniqueTaxId,
          countryCode: 'CL',
          email: 'contact@test.com',
          phone: '+56912345678',
          addresses: [
            {
              street: 'Av. Principal 123',
              city: 'Santiago',
              countryCode: 'CL',
              isPrimary: true,
            },
          ],
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.legalName).toBe('Empresa Test SpA');
      expect(response.body.data.taxId).toBe(uniqueTaxId);
      expect(response.body.data.countryCode).toBe('CL');
      expect(response.body.data.active).toBe(true);
      expect(response.body.data.addresses).toHaveLength(1);
      expect(response.body.data.addresses[0].isPrimary).toBe(true);
      expect(response.body.data.settings.regional.timezone).toBeDefined();

      createdOrgId = response.body.data.id;
    });

    it('debería rechazar taxId duplicado (409)', async () => {
      await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          legalName: 'Otra Empresa',
          taxId: uniqueTaxId,
          countryCode: 'CL',
        })
        .expect(409);
    });

    it('debería rechazar datos inválidos (400)', async () => {
      await request(app.getHttpServer())
        .post('/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ legalName: '', countryCode: 'CHILE' })
        .expect(400);
    });

    it('debería rechazar sin token (401)', async () => {
      await request(app.getHttpServer())
        .post('/organizations')
        .send({ legalName: 'X', countryCode: 'CL' })
        .expect(401);
    });

    it('debería haber persistido eventos en el outbox', async () => {
      const events = await prisma.outboxEvent.findMany({
        where: { aggregateType: 'Organization', aggregateId: createdOrgId },
      });
      expect(events.length).toBeGreaterThan(0);
      const created = events.find((e) => e.eventType === 'OrganizationCreatedEvent');
      expect(created).toBeDefined();
    });
  });

  // ==================== GET /organizations ====================
  describe('GET /organizations', () => {
    it('debería listar organizaciones con paginación', async () => {
      const response = await request(app.getHttpServer())
        .get('/organizations')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('perPage');
    });

    it('debería filtrar por countryCode', async () => {
      const response = await request(app.getHttpServer())
        .get('/organizations?countryCode=CL')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((o: any) => o.countryCode === 'CL')).toBe(true);
    });
  });

  describe('GET /organizations/search', () => {
    it('debería buscar por texto', async () => {
      const response = await request(app.getHttpServer())
        .get('/organizations/search?query=Test')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /organizations/primary', () => {
    it('debería obtener la organización primaria (del seed)', async () => {
      const response = await request(app.getHttpServer())
        .get('/organizations/primary')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      if (response.body.data) {
        expect(response.body.data.isPrimary).toBe(true);
      }
    });
  });

  describe('GET /organizations/:id', () => {
    it('debería obtener una organización por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/organizations/${createdOrgId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.id).toBe(createdOrgId);
      expect(response.body.data.settings).toBeDefined();
    });

    it('debería retornar 404 si no existe', async () => {
      await request(app.getHttpServer())
        .get('/organizations/00000000-0000-7000-8000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('debería retornar 400 si el UUID es inválido', async () => {
      await request(app.getHttpServer())
        .get('/organizations/not-a-uuid')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);
    });
  });

  // ==================== PATCH /organizations/:id ====================
  describe('PATCH /organizations/:id', () => {
    it('debería actualizar la organización', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/organizations/${createdOrgId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ tradeName: 'Test Updated' })
        .expect(200);

      expect(response.body.data.tradeName).toBe('Test Updated');
    });
  });

  // ==================== Settings ====================
  describe('PATCH /organizations/:id/settings/*', () => {
    it('debería actualizar regional settings', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/organizations/${createdOrgId}/settings/regional`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ timezone: 'America/Santiago', locale: 'es-CL', currency: 'CLP' })
        .expect(200);

      expect(response.body.data.settings.regional.timezone).toBe('America/Santiago');
    });

    it('debería actualizar fiscal settings', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/organizations/${createdOrgId}/settings/fiscal`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ fiscalYearStartMonth: 4 })
        .expect(200);

      expect(response.body.data.settings.fiscal.fiscalYearStartMonth).toBe(4);
    });

    it('debería actualizar branding', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/organizations/${createdOrgId}/settings/branding`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ primaryColor: '#ff6600' })
        .expect(200);

      expect(response.body.data.settings.branding.primaryColor).toBe('#ff6600');
    });

    it('debería rechazar color inválido (400)', async () => {
      await request(app.getHttpServer())
        .patch(`/organizations/${createdOrgId}/settings/branding`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ primaryColor: 'not-hex' })
        .expect(400);
    });
  });

  // ==================== activate / deactivate ====================
  describe('PATCH /organizations/:id/deactivate', () => {
    it('debería desactivar la organización', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/organizations/${createdOrgId}/deactivate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.active).toBe(false);
    });

    it('debería rechazar si ya está inactiva (409)', async () => {
      await request(app.getHttpServer())
        .patch(`/organizations/${createdOrgId}/deactivate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(409);
    });
  });

  describe('PATCH /organizations/:id/activate', () => {
    it('debería reactivarla', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/organizations/${createdOrgId}/activate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.active).toBe(true);
    });
  });

  // ==================== cleanup ====================
  afterAll(async () => {
    if (createdOrgId) {
      // borrar outbox events y la organización creada
      await prisma.outboxEvent.deleteMany({
        where: { aggregateId: createdOrgId, aggregateType: 'Organization' },
      });
      await prisma.organizationAddress.deleteMany({ where: { organizationId: createdOrgId } });
      await prisma.organizationRegionalSettings.deleteMany({
        where: { organizationId: createdOrgId },
      });
      await prisma.organizationFiscalSettings.deleteMany({
        where: { organizationId: createdOrgId },
      });
      await prisma.organizationNotificationSettings.deleteMany({
        where: { organizationId: createdOrgId },
      });
      await prisma.organizationBrandingSettings.deleteMany({
        where: { organizationId: createdOrgId },
      });
      await prisma.organizationSettings.deleteMany({ where: { organizationId: createdOrgId } });
      await prisma.organization.deleteMany({ where: { id: createdOrgId } });
    }
  });
});
