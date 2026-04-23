'use client';

/**
 * Collapsible - Componente expandible/colapsable reutilizable
 * 
 * Uso:
 * ```tsx
 * <Collapsible title="Mi Sección" icon={<Icon />} defaultOpen={false}>
 *   <Contenido />
 * </Collapsible>
 * ```
 * 
 * Props:
 * - title: Título de la sección
 * - icon: Icono opcional al lado del título
 * - defaultOpen: Si inicia abierto o cerrado (default: false)
 * - badge: Elemento opcional en el header (ej: Badge de estado)
 * - children: Contenido colapsable
 */

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CollapsibleProps {
  /** Título de la sección */
  title: string;
  /** Icono opcional al lado del título */
  icon?: ReactNode;
  /** Estado inicial (default: false = cerrado) */
  defaultOpen?: boolean;
  /** Elemento adicional en el header (ej: Badge) */
  badge?: ReactNode;
  /** Contenido colapsable */
  children: ReactNode;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Clases CSS adicionales para el header */
  headerClassName?: string;
}

export function Collapsible({
  title,
  icon,
  defaultOpen = false,
  badge,
  children,
  className = '',
  headerClassName = '',
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return (
    <section className={cn('border-2 border-foreground', className)}>
      {/* Header clickeable */}
      <button
        type="button"
        onClick={toggleOpen}
        className={cn(
          'w-full p-4 border-b-2 border-foreground bg-muted/30',
          'flex items-center justify-between',
          'hover:bg-muted/50 transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          !isOpen && 'border-b-0',
          headerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {badge}
          <ChevronDown 
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              isOpen && 'rotate-180'
            )} 
          />
        </div>
      </button>

      {/* Contenido colapsable con animación */}
      <div
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
