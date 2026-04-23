/**
 * Utilidades compartidas para componentes UI
 *
 * cn(): Combina clases de Tailwind de forma inteligente
 * - Merge correcto de clases conflictivas
 * - Soporte para condicionales
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
