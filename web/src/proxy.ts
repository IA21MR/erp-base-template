/**
 * Proxy de Next.js 16 para proteger rutas privadas
 * (Reemplaza el middleware.ts deprecado desde Next.js 16)
 * Redirige a /login si no hay token de autenticación
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Rutas públicas que no requieren autenticación
 */
const PUBLIC_ROUTES = ['/login', '/reset-password', '/qr-upload'];

/**
 * Verifica si una ruta es pública
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener tokens de las cookies
  const accessToken = request.cookies.get('access_token')?.value;

  // Redirigir de /login a /dashboard si ya tiene token
  if (pathname === '/login' && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Permitir acceso sin restricciones a rutas públicas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Rutas protegidas: redirigir a /login si no hay token
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Configuración del matcher para el proxy
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|test-auth|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
};
