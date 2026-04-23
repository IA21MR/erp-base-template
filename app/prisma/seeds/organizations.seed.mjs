// Seed del módulo opcional `organizations`.
// Crea (si no existe) la organización primaria y enlaza al admin.
// Importante: este seed corre ANTES de crear el usuario admin definitivo
// en modo multi-tenant, porque User.organizationId es NOT NULL.
import bcrypt from 'bcrypt';
import { uuidv7 } from 'uuidv7';
import { ORGANIZATIONS_PERMISSIONS } from '../permissions/organizations.mjs';

export async function seedOrganizationsPermissions(prisma) {
  console.log('🌱 [organizations] Creando permisos...');
  for (const permission of ORGANIZATIONS_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { description: permission.description },
      create: permission,
    });
  }
}

/**
 * Crea la organización primaria por defecto y el usuario admin asociado.
 * Devuelve `{ orgId, adminUser }`.
 *
 * Sustituye la parte de core que crea el admin cuando organizations está
 * activo (porque el User necesita organizationId NOT NULL).
 */
export async function seedOrganizationsBase(prisma) {
  console.log('🏢 [organizations] Verificando organización primaria por defecto...');
  const existingPrimary = await prisma.organization.findFirst({ where: { isPrimary: true } });
  let orgId;
  if (!existingPrimary) {
    orgId = uuidv7();
    await prisma.organization.create({
      data: {
        id: orgId,
        legalName: 'Mi Empresa',
        tradeName: 'Mi Empresa',
        countryCode: 'CL',
        active: true,
        isPrimary: true,
        createdByUserId: 0, // placeholder; se actualiza al final con el admin real
        updatedByUserId: 0,
        settings: {
          create: {
            regional: {
              create: {
                timezone: 'America/Santiago',
                locale: 'es-CL',
                currency: 'CLP',
                dateFormat: 'DD/MM/YYYY',
                numberFormat: '1.234,56',
                weekStart: 1,
                timeFormat: 'HH:mm',
              },
            },
            fiscal: { create: { fiscalYearStartMonth: 1 } },
            notifications: { create: { smsEnabled: false, enableEmail: true } },
            branding: { create: {} },
          },
        },
      },
    });
    console.log(`   ✓ Organización primaria creada (id=${orgId})`);
  } else {
    orgId = existingPrimary.id;
    console.log(`   ✓ Ya existe organización primaria (id=${orgId})`);
  }

  console.log('👤 [organizations] Creando usuario administrador (con organizationId)...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@sotek.com' },
    update: { organizationId: orgId },
    create: {
      name: 'Administrador',
      email: 'admin@sotek.com',
      passwordHash: hashedPassword,
      active: true,
      organizationId: orgId,
    },
  });

  // Alinear createdBy/updatedBy de la org primaria con el admin real.
  await prisma.organization.update({
    where: { id: orgId },
    data: { createdByUserId: adminUser.id, updatedByUserId: adminUser.id },
  });

  return { orgId, adminUser };
}

/**
 * Habilita los módulos opt-in activos (excepto core) para la organización primaria.
 */
export async function seedOrganizationModules(prisma, orgId, optionalModules) {
  console.log('🔌 [organizations] Habilitando módulos para la organización primaria...');
  for (const moduleName of optionalModules) {
    await prisma.organizationModule.upsert({
      where: { organizationId_moduleName: { organizationId: orgId, moduleName } },
      update: { enabled: true, disabledAt: null },
      create: { id: uuidv7(), organizationId: orgId, moduleName, enabled: true },
    });
    console.log(`   ✓ Módulo "${moduleName}" habilitado`);
  }
}
