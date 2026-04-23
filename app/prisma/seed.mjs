/**
 * Seed de la base de datos
 *
 * Crea:
 * 1. Permisos del sistema (importados de permissions.mjs)
 * 2. Roles: Administrador (todos los permisos) y Operario (permisos básicos)
 * 3. Usuario administrador por defecto
 *
 * Uso: npm run db:seed (o npx prisma db seed)
 */

import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { uuidv7 } from 'uuidv7';
import { ALL_PERMISSIONS } from './permissions.mjs';

// Cargar variables de entorno
config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ============================================
  // 1. CREAR PERMISOS
  // ============================================

  console.log(`📝 Creando ${ALL_PERMISSIONS.length} permisos...`);
  for (const permission of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { description: permission.description },
      create: permission,
    });
  }

  // ============================================
  // 2. CREAR ROLES
  // ============================================

  console.log('👥 Creando roles...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: { name: 'Administrador' },
  });

  const operatorRole = await prisma.role.upsert({
    where: { name: 'Operario' },
    update: {},
    create: { name: 'Operario' },
  });

  // ============================================
  // 3. ASIGNAR PERMISOS A ROLES
  // ============================================

  // Administrador: TODOS los permisos
  console.log('🔑 Asignando permisos al rol Administrador...');
  const allPermissions = await prisma.permission.findMany();

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Operario: sin permisos por defecto (se asignan desde UI)
  console.log('✓ Rol Operario creado sin permisos (se asignan desde UI)');

  // ============================================
  // 4. ORGANIZACIÓN PRIMARIA (debe existir ANTES del admin, por FK)
  // ============================================

  console.log('🏢 Verificando organización primaria por defecto...');
  const existingPrimary = await prisma.organization.findFirst({ where: { isPrimary: true } });
  let orgId;
  if (!existingPrimary) {
    orgId = uuidv7();
    // Nota: `createdByUserId`/`updatedByUserId` no son FK en el esquema.
    // Usamos 0 como placeholder y luego actualizamos al id del admin.
    await prisma.organization.create({
      data: {
        id: orgId,
        legalName: 'Mi Empresa',
        tradeName: 'Mi Empresa',
        countryCode: 'CL',
        active: true,
        isPrimary: true,
        createdByUserId: 0,
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

  // ============================================
  // 5. CREAR USUARIO ADMINISTRADOR (asociado a la organización primaria)
  // ============================================

  console.log('👤 Creando usuario administrador...');
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

  // Alinear createdBy/updatedBy de la organización primaria con el admin real
  await prisma.organization.update({
    where: { id: orgId },
    data: { createdByUserId: adminUser.id, updatedByUserId: adminUser.id },
  });

  // Asignar rol de Administrador al usuario
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // ============================================
  // 6. SEED CATÁLOGO ContactRoleType (sistema)
  // ============================================

  console.log('🏷️  Creando tipos de rol de contacto (sistema)...');
  const SYSTEM_CONTACT_ROLE_TYPES = [
    { code: 'CUSTOMER', label: 'Cliente' },
    { code: 'SUPPLIER', label: 'Proveedor' },
    { code: 'EMPLOYEE', label: 'Empleado' },
    { code: 'PROSPECT', label: 'Prospecto' },
    { code: 'PARTNER', label: 'Socio / Partner' },
    { code: 'OTHER', label: 'Otro' },
  ];

  for (const rt of SYSTEM_CONTACT_ROLE_TYPES) {
    await prisma.contactRoleType.upsert({
      where: { code: rt.code },
      update: { label: rt.label, isSystem: true },
      create: { id: uuidv7(), code: rt.code, label: rt.label, isSystem: true },
    });
  }

  // ============================================
  // 7. HABILITAR MÓDULOS PARA LA ORGANIZACIÓN PRIMARIA
  // ============================================

  console.log('🔌 Habilitando módulos para la organización primaria...');
  const DEFAULT_MODULES = ['contacts'];
  for (const moduleName of DEFAULT_MODULES) {
    await prisma.organizationModule.upsert({
      where: { organizationId_moduleName: { organizationId: orgId, moduleName } },
      update: { enabled: true, disabledAt: null },
      create: { id: uuidv7(), organizationId: orgId, moduleName, enabled: true },
    });
    console.log(`   ✓ Módulo "${moduleName}" habilitado`);
  }

  // ============================================
  // RESUMEN
  // ============================================

  console.log('✅ Seed completado exitosamente!');
  console.log('\n📌 Resumen:');
  console.log(`   Permisos creados: ${ALL_PERMISSIONS.length}`);
  console.log(`   Roles: Administrador (${allPermissions.length} permisos), Operario (0 permisos)`);
  console.log('\n👤 Usuario creado:');
  console.log('   Email: admin@sotek.com');
  console.log('   Password: admin123');
  console.log('   ⚠️  CAMBIAR LA CONTRASEÑA EN PRODUCCIÓN\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

