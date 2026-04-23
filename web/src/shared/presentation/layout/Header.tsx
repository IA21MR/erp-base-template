'use client';

/**
 * Header del Dashboard
 *
 * - Título de la página actual
 * - Info del usuario autenticado
 * - Botón de logout
 */

import { useAuth, useLogout } from '@/modules/auth';
import { usePermissions } from '@/modules/auth/presentation/hooks/usePermissions';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'Dashboard' }: HeaderProps) {
  const { user: authUser, isLoading } = useAuth();
  const { user: tokenUser } = usePermissions();
  const { logout, isLoggingOut } = useLogout();

  // Priorizar datos del perfil completo, pero usar token como fallback
  const displayUser = authUser ?? tokenUser;
  const nameFromUser = displayUser && 'name' in displayUser ? String((displayUser as { name?: string }).name ?? '') : '';
  const userName: string = nameFromUser || displayUser?.email?.split('@')[0] || 'Usuario';
  const userEmail = displayUser?.email || '';
  
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b-2 border-foreground bg-card px-6 flex items-center justify-end">

      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 w-24 bg-muted rounded mb-1"></div>
            <div className="h-3 w-32 bg-muted rounded"></div>
          </div>
        ) : (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userEmail || 'Sin email'}</p>
            </div>
            <div className="w-10 h-10 border-2 border-foreground bg-accent flex items-center justify-center font-bold">
              {initials}
            </div>
            <button
              onClick={logout}
              disabled={isLoggingOut}
              className="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              title="Cerrar sesión"
            >
              {isLoggingOut ? 'Saliendo...' : 'Salir'}
            </button>
          </>
        )}
      </div>
    </header>
  );
}
