'use client';

/**
 * Layout principal del Dashboard
 *
 * Componente contenedor que integra:
 * - Sidebar colapsable
 * - Header con info del usuario
 * - Área de contenido principal
 *
 * Uso:
 * ```tsx
 * <DashboardLayout title="Clientes">
 *   <CustomerList />
 * </DashboardLayout>
 * ```
 */

import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  user?: {
    name: string;
    role: string;
  };
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <main className="flex-1 flex flex-col">
        <Header title={title} />

        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
