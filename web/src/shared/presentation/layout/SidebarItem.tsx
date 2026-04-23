'use client';

/**
 * Item individual del sidebar
 *
 * - Estado activo basado en ruta
 * - Soporte para colapso
 * - Animaciones suaves
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import type { MenuItem } from '../navigation/menu.config';
import { usePermissions } from '@/modules/auth/presentation/hooks/usePermissions';

interface SidebarItemProps {
  item: MenuItem;
  collapsed: boolean;
}

export function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const { hasPermission } = usePermissions();
  const Icon = item.icon;

  // Si el item requiere un permiso y el usuario no lo tiene, no renderizar
  if (item.permission && !hasPermission(item.permission)) {
    return null;
  }

  // Si el item debe ocultarse cuando el usuario tiene cierto permiso, no renderizar
  if (item.hideIfPermission && hasPermission(item.hideIfPermission)) {
    return null;
  }

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        'border-b border-border/50',
        'hover:bg-accent transition-colors',
        'relative',
        isActive && 'bg-primary text-primary-foreground',
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <div className="flex items-center justify-between flex-1">
          <span className="font-medium">{item.label}</span>
        </div>
      )}
    </Link>
  );
}
