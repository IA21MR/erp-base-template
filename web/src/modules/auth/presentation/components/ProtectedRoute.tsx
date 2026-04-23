/**
 * Componente para proteger rutas que requieren permisos específicos
 * Muestra un mensaje de error o redirige si el usuario no tiene los permisos necesarios
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthToken } from '../hooks/useAuthToken';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Permisos requeridos - el usuario debe tener AL MENOS UNO de estos permisos
   */
  requiredPermissions?: string[];
  /**
   * Si es true, el usuario debe tener TODOS los permisos especificados
   */
  requireAllPermissions?: boolean;
  /**
   * Ruta a la que redirigir si no tiene permisos (por defecto muestra mensaje de error)
   */
  redirectTo?: string;
  /**
   * Mensaje personalizado a mostrar si no tiene permisos
   */
  unauthorizedMessage?: string;
}

export function ProtectedRoute({
  children,
  requiredPermissions = [],
  requireAllPermissions = false,
  redirectTo,
  unauthorizedMessage = 'No tienes autorización para acceder a esta página',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { hasTokens } = useAuthToken();
  const { hasAllPermissions, hasAnyPermission } = usePermissions();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar autenticación
    if (!hasTokens) {
      router.push('/login');
      return;
    }

    // Si no hay permisos requeridos, permitir acceso
    if (requiredPermissions.length === 0) {
      setIsChecking(false);
      return;
    }

    // Verificar permisos
    const hasPermission = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasPermission) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        setIsChecking(false);
      }
      return;
    }

    setIsChecking(false);
  }, [
    hasTokens,
    requiredPermissions,
    requireAllPermissions,
    hasAllPermissions,
    hasAnyPermission,
    redirectTo,
    router,
  ]);

  // Mostrar loading mientras verifica
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Verificar si tiene permisos
  if (requiredPermissions.length > 0) {
    const hasPermission = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasPermission && !redirectTo) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-6">{unauthorizedMessage}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Ir al Dashboard
              </button>
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Volver
              </button>
            </div>
            {requiredPermissions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">
                  Permisos requeridos:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {requiredPermissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
