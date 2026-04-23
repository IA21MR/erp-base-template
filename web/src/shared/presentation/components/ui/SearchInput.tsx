/**
 * Componente SearchInput - Base UI
 *
 * Campo de búsqueda reutilizable con ícono y botón de limpiar.
 * Usar en cualquier módulo que necesite filtrar por texto.
 *
 * Con `onSearch`: añade botón de buscar y dispara en Enter.
 * Útil para búsquedas explícitas (ej. lector de código de barras).
 */

'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './Input';

export interface SearchInputProps
  extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'onKeyDown'> {
  value: string;
  onChange: (value: string) => void;
  /** Dispara al presionar Enter o el botón de buscar. Muestra botón de búsqueda explícito. */
  onSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      onSearch,
      onClear,
      placeholder = 'Buscar...',
      className,
      disabled,
      ...props
    },
    ref,
  ) {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch && value.trim()) {
        onSearch(value.trim());
      }
    };

    const showClearButton = value && !disabled;
    const showSearchButton = onSearch && value && !disabled;

    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn('pl-9', showSearchButton ? 'pr-20' : showClearButton ? 'pr-9' : '')}
          {...props}
        />
        {showClearButton && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
            {showSearchButton && (
              <button
                type="button"
                onClick={() => onSearch(value.trim())}
                disabled={disabled || !value.trim()}
                className="flex items-center justify-center h-7 w-7 bg-foreground text-background hover:bg-foreground/80 transition-colors disabled:opacity-50"
                aria-label="Buscar"
              >
                <Search className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);
