/**
 * Componente OperationalFilters - Base UI
 *
 * Grupo de botones tipo "pill" (píldoras) para filtros principales interactivos
 * Permite mostrar indicadores de colores (puntos) y contadores integrados.
 */

'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface OperationalFilterOption<T extends string = string> {
  value: T;
  label: ReactNode;
  /** Color tailwind para el punto indicador (ej: 'bg-red-500') */
  dotColor?: string;
}

export interface OperationalFiltersProps<T extends string = string> {
  options: OperationalFilterOption<T>[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
  /** Contadores opcionales para cada filtro */
  counts?: Partial<Record<T, number>>;
  className?: string;
}

export function OperationalFilters<T extends string = string>({
  options,
  activeFilter,
  onFilterChange,
  counts,
  className,
}: OperationalFiltersProps<T>) {
  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      {options.map((option) => {
        const isActive = activeFilter === option.value;
        const count = counts?.[option.value];

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onFilterChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              isActive
                ? 'bg-foreground text-background'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
          >
            {option.dotColor && (
              <span className={cn('h-1.5 w-1.5 rounded-full', option.dotColor)} />
            )}
            
            {option.label}
            
            {count != null && count > 0 && (
              <span className={cn(
                'text-[10px] font-bold ml-0.5',
                isActive ? 'text-background/70' : 'text-gray-500',
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
