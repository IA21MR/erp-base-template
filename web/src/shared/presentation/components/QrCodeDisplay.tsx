'use client';

/**
 * QrCodeDisplay — Componente atómico compartido
 *
 * Muestra el código QR con temporizador, estado de carga,
 * errores y botón de regenerar.
 *
 * Usado por:
 * - QrUploadModal (clientes naturales)
 * - PersonPhotosModal (personas asociadas a empresa)
 */

import { Loader2, RefreshCw, Clock, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './ui/Button';

export interface QrCodeDisplayProps {
  /** URL a codificar en el QR */
  uploadUrl: string | null;
  /** Segundos restantes del token */
  secondsRemaining: number;
  /** Indica que se está generando el token */
  isLoading: boolean;
  /** Mensaje de error, si hay */
  error: string | null;
  /** El token ha expirado */
  isExpired: boolean;
  /** Estado de la conexión WebSocket */
  isConnected: boolean;
  /** Estado de verificación parcial (recibido por WS) */
  verificationStatus?: 'idle' | 'connecting' | 'subscribed' | 'partial' | 'complete';
  /** Callback para generar / regenerar el token */
  onGenerateToken: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function QrCodeDisplay({
  uploadUrl,
  secondsRemaining,
  isLoading,
  error,
  isExpired,
  isConnected,
  verificationStatus,
  onGenerateToken,
}: QrCodeDisplayProps) {
  const timerColor =
    secondsRemaining > 30
      ? 'text-green-600'
      : secondsRemaining > 10
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Indicador WebSocket */}
      <div className={`flex items-center gap-1.5 text-xs ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
        {isConnected ? (
          <><Wifi className="h-3 w-3" /><span>Conectado — esperando fotos en tiempo real</span></>
        ) : (
          <><WifiOff className="h-3 w-3" /><span>Conectando...</span></>
        )}
      </div>

      {/* Cargando */}
      {isLoading && (
        <div className="h-56 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-6">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button onClick={onGenerateToken} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {/* QR Expirado */}
      {isExpired && !isLoading && !error && (
        <div className="text-center py-6">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4 text-sm">El código QR ha expirado</p>
          <Button onClick={onGenerateToken}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generar nuevo código
          </Button>
        </div>
      )}

      {/* QR Activo */}
      {uploadUrl && !isExpired && !isLoading && !error && (
        <>
          <div className="bg-white p-4 shadow-inner border">
            <QRCodeSVG value={uploadUrl} size={200} level="M" includeMargin />
          </div>

          <div className={`flex items-center gap-2 ${timerColor}`}>
            <Clock className="h-5 w-5" />
            <span className="text-2xl font-mono font-bold">{formatTime(secondsRemaining)}</span>
          </div>

          {verificationStatus === 'partial' && (
            <div className="px-4 py-2 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
              ✓ Una foto recibida — esperando la otra...
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground max-w-xs space-y-1">
            <p>1. Escanea con la cámara del celular</p>
            <p>2. Toma fotos del frente y reverso del carnet</p>
            <p>3. Las fotos se detectarán automáticamente</p>
          </div>

          <Button variant="ghost" size="sm" onClick={onGenerateToken} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Regenerar código
          </Button>
        </>
      )}
    </div>
  );
}
