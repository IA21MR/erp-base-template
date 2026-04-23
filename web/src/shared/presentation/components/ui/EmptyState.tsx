'use client';

/**
 * EmptyState — shared/presentation/components/ui
 *
 * Componente de estado vacío reutilizable.
 * Reemplaza los bloques inline border-2 border-dashed + icono + texto.
 */

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-2 border-dashed border-foreground/20 p-16 text-center text-muted-foreground',
        className,
      )}
    >
      {Icon && <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />}
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm mt-1">{description}</p>}
      {children}
    </div>
  );
}
