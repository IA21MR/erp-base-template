/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a /login si no hay token válido
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthToken } from '@/modules/auth/presentation/hooks/useAuthToken';
import { AuthHttpRepository } from '@/modules/auth/infrastructure/repositories/AuthHttpRepository';

interface AuthGuardProps {
  children: React.ReactNode;
}

const authRepository = new AuthHttpRepository();

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { accessToken, isTokenExpired, clearTokens } = useAuthToken();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verifyAuthentication = async () => {
      // Esperar un momento para que el token se cargue desde localStorage
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const currentToken = accessToken;
      
      // 1. Verificar si hay token
      if (!currentToken) {
        clearTokens();
        setIsAuthenticated(false);
        setIsChecking(false);
        router.push('/login');
        return;
      }

      // 2. Verificar si el token está expirado
      if (isTokenExpired(currentToken)) {
        clearTokens();
        setIsAuthenticated(false);
        setIsChecking(false);
        router.push('/login');
        return;
      }

      // 3. Verificar que el token sea válido con el servidor
      try {
        await authRepository.getProfile();
        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        console.error('[AuthGuard] Token invalid or server error:', error);
        clearTokens();
        setIsAuthenticated(false);
        setIsChecking(false);
        router.push('/login');
      }
    };

    verifyAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar

  // Mostrar loading mientras verifica
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (ya redirigiendo)
  if (!isAuthenticated) {
    return null;
  }

  // Si hay token válido, renderizar contenido
  return <>{children}</>;
}
