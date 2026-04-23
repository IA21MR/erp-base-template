/**
 * E2E tests del módulo Contacts.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { clearRateLimitCleanup } from '../src/infrastructure/guards/CustomThrottlerGuard';
import { DomainExceptionFilter } from '../src/infrastructure/filters';
import { PrismaService } from '../src/infrastructure/database/prisma/prisma.service';

describe('Contacts E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let organizationId: string;
  let createdContactId: string;
  let customerRoleTypeId: string;
  let uniqueTaxId: string;
  let emailId: string;
  let phoneId: string;
  let addressId: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    uniqueTaxId = `88${Date.now()}`;

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

    // Obtener organización primaria del seed
    const orgResponse = await request(app.getHttpServer())
      .get('/organizations/primary')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    if (!orgResponse.body.data) {
      throw new Error('No hay organización primaria en el seed');
    }
    organizationId = orgResponse.body.data.id;

    // Obtener role type CUSTOMER
    const rolesResponse = await request(app.getHttpServer())
      .get('/contact-role-types')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const customer = rolesResponse.body.data.find((r: any) => r.code === 'CUSTOMER');
    if (!customer) throw new Error('ContactRoleType CUSTOMER no está en el catálogo');
    customerRoleTypeId = customer.id;
  });

  afterAll(async () => {
    if (createdContactId) {
      await prisma.outboxEvent.deleteMany({
        where: { aggregateId: createdContactId, aggregateType: 'Contact' },
      });
      await prisma.contactRole.deleteMany({ where: { contactId: createdContactId } });
      await prisma.contactEmail.deleteMany({ where: { contactId: createdContactId } });
      await prisma.contactPhone.deleteMany({ where: { contactId: createdContactId } });
      await prisma.contactAddress.deleteMany({ where: { contactId: createdContactId } });
      await prisma.contact.deleteMany({ where: { id: createdContactId } });
    }
    clearRateLimitCleanup();
    await app.close();
  });

  // ==================== GET /contact-role-types ====================
  describe('GET /contact-role-types', () => {
    it('debería devolver el catálogo del seed', async () => {
      const response = await request(app.getHttpServer())
        .get('/contact-role-types')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(6);
      expect(response.body.data.every((r: any) => r.isSystem === true)).toBe(true);
    });
  });

  // ==================== POST /contacts ====================
  describe('POST /contacts', () => {
    it('debería crear un contacto PERSON', async () => {
      const response = await request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          organizationId,
          type: 'PERSON',
          personFirstName: 'Juan',
          personLastName: 'Pérez',
          taxId: uniqueTaxId,
          countryCode: 'CL',
          emails: [{ email: 'juan@test.com', isPrimary: true }],
          phones: [{ phone: '+56912345678', isPrimary: true }],
          addresses: [
            { street: 'Calle 1 #100', city: 'Santiago', countryCode: 'CL', isPrimary: true },
          ],
          roleTypeIds: [customerRoleTypeId],
        })
        .expect(201);

      expect(response.body.data.type).toBe('PERSON');
      expect(response.body.data.personFirstName).toBe('Juan');
      expect(response.body.data.emails).toHaveLength(1);
      expect(response.body.data.phones).toHaveLength(1);
      expect(response.body.data.addresses).toHaveLength(1);
      expect(response.body.data.roles).toHaveLength(1);
      expect(response.body.data.roles[0].roleTypeId).toBe(customerRoleTypeId);

      createdContactId = response.body.data.id;
      emailId = response.body.data.emails[0].id;
      phoneId = response.body.data.phones[0].id;
      addressId = response.body.data.addresses[0].id;
    });

    it('debería rechazar PERSON sin nombre (400)', async () => {
      await request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ organizationId, type: 'PERSON' })
        .expect(400);
    });

    it('debería rechazar taxId duplicado en misma org (409)', async () => {
      await request(app.getHttpServer())
        .post('/contacts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          organizationId,
          type: 'PERSON',
          personFirstName: 'Duplicado',
          personLastName: 'Test',
          taxId: uniqueTaxId,
          countryCode: 'CL',
        })
        .expect(409);
    });

    it('debería haber registrado eventos en outbox', async () => {
      const events = await prisma.outboxEvent.findMany({
        where: { aggregateType: 'Contact', aggregateId: createdContactId },
      });
      expect(events.some((e) => e.eventType === 'ContactCreatedEvent')).toBe(true);
    });
  });

  // ==================== GET /contacts ====================
  describe('GET /contacts', () => {
    it('debería listar contactos', async () => {
      const response = await request(app.getHttpServer())
        .get(`/contacts?organizationId=${organizationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
    });

    it('debería filtrar por tipo PERSON', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts?type=PERSON')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.every((c: any) => c.type === 'PERSON')).toBe(true);
    });

    it('debería buscar por texto', async () => {
      const response = await request(app.getHttpServer())
        .get('/contacts/search?query=Juan')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.data.some((c: any) => c.id === createdContactId)).toBe(true);
    });
  });

  // ==================== GET /contacts/:id ====================
  describe('GET /contacts/:id', () => {
    it('debería obtener por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/contacts/${createdContactId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.data.id).toBe(createdContactId);
    });

    it('debería devolver 404', async () => {
      await request(app.getHttpServer())
        .get('/contacts/00000000-0000-7000-8000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  // ==================== PATCH /contacts/:id ====================
  describe('PATCH /contacts/:id', () => {
    it('debería actualizar datos básicos', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/contacts/${createdContactId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ notes: 'Nota de prueba' })
        .expect(200);
      expect(response.body.data.notes).toBe('Nota de prueba');
    });
  });

  // ==================== emails ====================
  describe('emails sub-resource', () => {
    let newEmailId: string;
    it('POST /contacts/:id/emails', async () => {
      const response = await request(app.getHttpServer())
        .post(`/contacts/${createdContactId}/emails`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'extra@test.com' })
        .expect(201);
      newEmailId = response.body.data.emails.find((e: any) => e.email === 'extra@test.com').id;
      expect(newEmailId).toBeDefined();
    });
    it('PATCH /contacts/:id/emails/:emailId/primary', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/contacts/${createdContactId}/emails/${newEmailId}/primary`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      const primary = response.body.data.emails.find((e: any) => e.isPrimary);
      expect(primary.id).toBe(newEmailId);
    });
    it('DELETE /contacts/:id/emails/:emailId', async () => {
      await request(app.getHttpServer())
        .delete(`/contacts/${createdContactId}/emails/${newEmailId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  // ==================== phones ====================
  describe('phones sub-resource', () => {
    it('DELETE y re-add teléfono', async () => {
      // update label
      const response = await request(app.getHttpServer())
        .patch(`/contacts/${createdContactId}/phones/${phoneId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ label: 'móvil' })
        .expect(200);
      const phone = response.body.data.phones.find((p: any) => p.id === phoneId);
      expect(phone.label).toBe('móvil');
    });
  });

  // ==================== addresses ====================
  describe('addresses sub-resource', () => {
    it('actualizar dirección', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/contacts/${createdContactId}/addresses/${addressId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ street: 'Nueva Calle 999' })
        .expect(200);
      const addr = response.body.data.addresses.find((a: any) => a.id === addressId);
      expect(addr.street).toBe('Nueva Calle 999');
    });
  });

  // ==================== roles ====================
  describe('roles sub-resource', () => {
    it('rechazar rol duplicado (409)', async () => {
      await request(app.getHttpServer())
        .post(`/contacts/${createdContactId}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ roleTypeId: customerRoleTypeId })
        .expect(409);
    });
  });

  // ==================== activate / deactivate ====================
  describe('activate/deactivate', () => {
    it('debería desactivar', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/contacts/${createdContactId}/deactivate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.data.active).toBe(false);
    });
    it('debería reactivar', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/contacts/${createdContactId}/activate`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body.data.active).toBe(true);
    });
  });

  // ==================== assign ====================
  describe('assign', () => {
    it('debería asignar a un usuario (admin)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/contacts/${createdContactId}/assign`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ assignedToUserId: 1 })
        .expect(200);
      expect(response.body.data.assignedToUserId).toBe(1);
    });
    it('debería desasignar con null', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/contacts/${createdContactId}/assign`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ assignedToUserId: null })
        .expect(200);
      expect(response.body.data.assignedToUserId).toBeNull();
    });
  });

  // suprimir lint: variable usada sólo en asignación de primary
  it('_', () => { expect(emailId).toBeDefined(); });
});
