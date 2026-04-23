/**
 * Página principal del Dashboard
 *
 * Muestra información básica del sistema de autenticación y RBAC
 */

'use client';

import { LayoutDashboard, Users, Shield, Building2, Contact, type LucideIcon } from 'lucide-react';
import { usePermissions } from '@/modules/auth/presentation/hooks/usePermissions';

export default function DashboardPage() {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 border-2 border-foreground bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
          <LayoutDashboard className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bienvenido al ERP</h1>
          <p className="text-base text-muted-foreground mt-1">
            Sistema de gestión con autenticación y control de acceso basado en roles
          </p>
        </div>
      </div>

      {/* Módulos disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hasPermission('READ_ORGANIZATION') && (
          <ModuleCard
            title="Organizaciones"
            description="Administra las organizaciones del ERP"
            icon={Building2}
            href="/organizations"
          />
        )}
        {hasPermission('READ_CONTACT') && (
          <ModuleCard
            title="Contactos"
            description="Gestiona personas y empresas del negocio"
            icon={Contact}
            href="/contacts"
          />
        )}
        {hasPermission('LIST_USERS') && (
          <ModuleCard
            title="Usuarios"
            description="Gestiona los usuarios del sistema"
            icon={Users}
            href="/users"
          />
        )}
        {hasPermission('READ_ROLE') && (
          <ModuleCard
            title="Roles y Permisos"
            description="Administra roles y asigna permisos"
            icon={Shield}
            href="/roles"
          />
        )}
      </div>

      {/* Información del sistema */}
      <div className="border-2 border-foreground bg-card mt-8">
        <div className="p-4 border-b-2 border-foreground">
          <h3 className="font-bold text-base">Información del Sistema</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            <InfoRow label="Sistema" value="ERP - Autenticación y RBAC" />
            <InfoRow label="Versión" value="1.0.0" />
            <InfoRow label="Módulos Activos" value="Auth, Users, Roles, Organizations, Contacts" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
}) {
  return (
    <a
      href={href}
      className="border-2 border-foreground bg-card hover:bg-secondary/50 transition-colors p-6 flex items-start gap-4"
    >
      <div className="p-3 bg-primary text-primary-foreground border border-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
