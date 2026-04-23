/**
 * Componente FilterChips - Base UI
 *
 * Grupo de botones tipo "pill" para filtrar por categorías/estados.
 * Genérico y reutilizable en cualquier módulo.
 */

'use client';

import { cn } from '@/lib/utils';

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
  /** Opcional: muestra un contador dentro del chip */
  count?: number;
}

export interface FilterChipsProps<T extends string = string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterChips<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: FilterChipsProps<T>) {
  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 border-foreground transition-colors',
              isActive
                ? 'bg-foreground text-background'
                : 'bg-background text-foreground hover:bg-foreground/10',
            )}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold border',
                  isActive
                    ? 'border-background/40 bg-background/20 text-background'
                    : 'border-foreground/30 bg-foreground/10 text-foreground',
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
