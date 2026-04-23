'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthToken } from '@/modules/auth/presentation/hooks/useAuthToken';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/shared/presentation/components/ui/AlertDialog';

/** Máximo de segundos antes de la expiración para mostrar el aviso */
const MAX_WARNING_MS = 5 * 60 * 1000; // 5 minutos
/** Mínimo de segundos de aviso (siempre mostrar al menos este tiempo) */
const MIN_WARNING_MS = 30 * 1000; // 30 segundos

/**
 * Decodifica el payload de un JWT sin validar firma
 */
function decodeJwtExp(token: string): number | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(json);
    return payload.exp ?? null;
  } catch {
    return null;
  }
}

/**
 * Componente que muestra un aviso cuando la sesión está por expirar.
 * Se monta dentro del dashboard layout para que esté presente en toda la app autenticada.
 */
export function SessionExpirationWarning() {
  const router = useRouter();
  const { accessToken, refreshToken: storedRefreshToken, setTokens, clearTokens } = useAuthToken();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Limpia timers pendientes */
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  /** Programa el aviso según la expiración del token actual */
  const scheduleWarning = useCallback(
    (token: string) => {
      clearTimers();

      const exp = decodeJwtExp(token);
      if (!exp) return;

      const now = Date.now();
      const expiresAtMs = exp * 1000;
      const tokenLifetimeMs = expiresAtMs - now;

      // Si el token ya expiró o expira en menos de 1 segundo, no hacer nada
      if (tokenLifetimeMs <= 1000) return;

      // Calcular umbral de aviso: 25% del lifetime, entre MIN y MAX
      const warningMs = Math.min(MAX_WARNING_MS, Math.max(MIN_WARNING_MS, tokenLifetimeMs * 0.25));
      const delay = tokenLifetimeMs - warningMs;

      timerRef.current = setTimeout(() => {
        const remaining = Math.floor((expiresAtMs - Date.now()) / 1000);
        setRemainingSeconds(remaining > 0 ? remaining : 0);
        setShowWarning(true);
      }, delay);
    },
    [clearTimers],
  );

  /** Inicia cuenta regresiva cuando se muestra el aviso */
  useEffect(() => {
    if (!showWarning) return;

    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Tiempo agotado – forzar cierre de sesión
          clearTimers();
          clearTokens();
          setShowWarning(false);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [showWarning, clearTimers, clearTokens, router]);

  /** Programa aviso cada vez que cambia el token */
  useEffect(() => {
    if (accessToken) {
      scheduleWarning(accessToken);
    }
    return clearTimers;
  }, [accessToken, scheduleWarning, clearTimers]);

  /** Continuar sesión → refrescar token */
  const handleContinue = async () => {
    if (!storedRefreshToken) {
      clearTokens();
      router.push('/login');
      return;
    }

    setIsRefreshing(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!response.ok) throw new Error('Refresh failed');

      const body = await response.json();
      // El backend devuelve data.access_token (snake_case)
      const newAccessToken: string = body.data?.access_token ?? body.data?.accessToken;

      if (!newAccessToken) throw new Error('No access token in response');

      // Guardar nuevo access token; refresh token permanece igual
      setTokens(newAccessToken, storedRefreshToken);
      setShowWarning(false);
      clearTimers();
    } catch {
      // Si falla el refresh, cerrar sesión
      clearTokens();
      setShowWarning(false);
      router.push('/login');
    } finally {
      setIsRefreshing(false);
    }
  };

  /** Cerrar sesión */
  const handleLogout = () => {
    clearTimers();
    clearTokens();
    setShowWarning(false);
    router.push('/login');
  };

  /** Formatea los segundos restantes como mm:ss */
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>La sesión está por expirar</AlertDialogTitle>
          <AlertDialogDescription>
            Tu sesión se cerrará automáticamente en{' '}
            <span className="font-semibold text-orange-600">{formatTime(remainingSeconds)}</span>.
            <br />
            ¿Deseas continuar trabajando?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleLogout} disabled={isRefreshing}>
            Cerrar sesión
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleContinue} disabled={isRefreshing}>
            {isRefreshing ? 'Renovando...' : 'Sí, continuar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
