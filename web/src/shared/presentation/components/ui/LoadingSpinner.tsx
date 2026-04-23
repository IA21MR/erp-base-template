'use client';

/**
 * LoadingSpinner — shared/presentation/components/ui
 *
 * Spinner de carga reutilizable. Reemplaza los ~7 bloques inline
 * de animate-spin + border-4 dispersos en la aplicación.
 */

import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

export function LoadingSpinner({ message, className, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div
        className={cn(
          'animate-spin border-foreground border-t-transparent rounded-full mx-auto mb-4',
          sizeClasses[size],
        )}
      />
      {message && (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}
