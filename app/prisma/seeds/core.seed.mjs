// Seed del módulo core (users + roles + permisos core + usuario admin).
// Devuelve objetos útiles (orgId no aplica aquí — lo agrega el módulo
// organizations si está activo).
import bcrypt from 'bcrypt';
import { CORE_PERMISSIONS } from '../permissions/core.mjs';

export async function seedCore(prisma, { activeModules }) {
  console.log('🌱 [core] Creando permisos core...');
  for (const permission of CORE_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: { description: permission.description },
      create: permission,
    });
  }

  console.log('👥 [core] Creando roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: { name: 'Administrador' },
  });
  await prisma.role.upsert({
    where: { name: 'Operario' },
    update: {},
    create: { name: 'Operario' },
  });

  console.log('👤 [core] Creando usuario administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Si organizations NO está activo, User no tiene organizationId.
  // Si está activo, el seed de organizations hará backfill después.
  const data = {
    name: 'Administrador',
    email: 'admin@sotek.com',
    passwordHash: hashedPassword,
    active: true,
  };
  if (activeModules.includes('organizations')) {
    // organizationId obligatorio si el módulo organizations está activo.
    // El seed de organizations corre DESPUÉS y puede ajustar la FK si
    // el usuario ya existía con otra organización.
    // Aquí dejamos un marcador que organizations.seed.mjs resolverá.
    // Prisma no permite nulls en NOT NULL, así que el seed de organizations
    // debe crear primero la org y asignar este campo. Ver orchestration.
  }

  return { adminRole };
}

/**
 * Asigna TODOS los permisos actuales al rol Administrador.
 * Se llama al final, cuando todos los módulos ya sembraron sus permisos.
 */
export async function grantAllPermissionsToAdmin(prisma) {
  const admin = await prisma.role.findUnique({ where: { name: 'Administrador' } });
  if (!admin) throw new Error('Rol Administrador no encontrado');

  const all = await prisma.permission.findMany();
  console.log(`🔑 [core] Asignando ${all.length} permisos al rol Administrador...`);
  for (const p of all) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: admin.id, permissionId: p.id } },
      update: {},
      create: { roleId: admin.id, permissionId: p.id },
    });
  }
}

/**
 * Asigna el rol Administrador al usuario admin@sotek.com (si existe).
 * Se hace al final para respetar el orden de dependencias de FKs.
 */
export async function assignAdminRoleToAdminUser(prisma) {
  const admin = await prisma.role.findUnique({ where: { name: 'Administrador' } });
  const user = await prisma.user.findUnique({ where: { email: 'admin@sotek.com' } });
  if (!admin || !user) return;
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: admin.id } },
    update: {},
    create: { userId: user.id, roleId: admin.id },
  });
}
