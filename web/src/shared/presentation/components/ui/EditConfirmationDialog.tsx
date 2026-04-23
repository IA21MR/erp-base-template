'use client';

/**
 * Diálogo de confirmación para edición
 *
 * Muestra un resumen de los cambios (antes → después) para que el usuario
 * confirme antes de guardar.
 */

import { Loader2, ArrowRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './AlertDialog';

export interface FieldChange {
  label: string;
  before: string;
  after: string;
}

interface EditConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  changes: FieldChange[];
  isLoading?: boolean;
}

export function EditConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Confirmar cambios',
  description = 'Revisa los cambios antes de guardar:',
  changes,
  isLoading = false,
}: EditConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {changes.length > 0 ? (
          <div className="border-2 border-foreground divide-y divide-foreground/20 max-h-[40vh] overflow-y-auto">
            {changes.map((change, idx) => (
              <div key={idx} className="px-4 py-3 space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {change.label}
                </span>
                <div className="flex items-start gap-2 text-sm">
                  <span className="flex-1 bg-muted text-muted-foreground border border-border px-2 py-1 line-through break-words min-w-0">
                    {change.before || '(vacío)'}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 mt-1.5 text-muted-foreground" />
                  <span className="flex-1 bg-muted text-foreground border border-border px-2 py-1 break-words min-w-0">
                    {change.after || '(vacío)'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">No se detectaron cambios.</p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading || changes.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Confirmar cambios'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
