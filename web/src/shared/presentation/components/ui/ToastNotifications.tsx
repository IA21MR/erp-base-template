'use client';

/**
 * ToastNotifications — shared/presentation/components/ui
 *
 * Wrapper que renderiza la lista de toasts con ToastContainer.
 * Reemplaza el JSX repetido de <ToastContainer> + .map() en múltiples vistas.
 */

import { Toast, ToastContainer } from './Toast';
import type { ToastType } from './Toast';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastNotificationsProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export function ToastNotifications({ toasts, onClose }: ToastNotificationsProps) {
  if (toasts.length === 0) return null;

  return (
    <ToastContainer>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={onClose}
        />
      ))}
    </ToastContainer>
  );
}
