'use client';

/**
 * FiltersBar (shared)
 *
 * Contenedor genérico para barras de filtros.
 * Provee el layout estándar (container + botón limpiar) y
 * acepta children para los controles de filtro específicos de cada módulo.
 */

import { X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface FiltersBarProps {
  /** Controles de filtro específicos del módulo */
  children: React.ReactNode;
  /** Si hay filtros activos (muestra el botón limpiar) */
  hasActiveFilters: boolean;
  /** Callback para limpiar todos los filtros */
  onClearFilters: () => void;
  /** Texto del botón limpiar */
  clearLabel?: string;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Clases CSS adicionales para el área de children */
  contentClassName?: string;
}

export function FiltersBar({
  children,
  hasActiveFilters,
  onClearFilters,
  clearLabel = 'Limpiar filtros',
  className,
  contentClassName,
}: FiltersBarProps) {
  return (
    <div className={cn('flex flex-col gap-4 p-4 border-2 border-foreground bg-card', className)}>
      <div className={cn(contentClassName)}>{children}</div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            {clearLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
