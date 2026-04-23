'use client';

/**
 * ModulePageHeader — shared/presentation/components
 *
 * Header genérico reutilizable para páginas de módulos.
 * Estructura: flex justify-between con título/descripción + acciones.
 */

import { cn } from '@/lib/utils';

interface ModulePageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function ModulePageHeader({
  title,
  description,
  icon,
  actions,
  className,
  children,
}: ModulePageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4', className)}>
      <div className="hidden items-center gap-3">
        {icon}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
      {children}
    </div>
  );
}
