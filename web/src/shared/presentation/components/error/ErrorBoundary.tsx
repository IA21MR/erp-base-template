'use client';

/**
 * ErrorBoundary - Captura errores de React y muestra UI de fallback
 * 
 * Evita que un error en un componente hijo rompa toda la aplicación.
 * Muestra un mensaje amigable en lugar de pantalla blanca.
 * 
 * @example
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <ComponenteQuePuedeFallar />
 * </ErrorBoundary>
 * 
 * @example Con render prop para acceso al error
 * <ErrorBoundary
 *   fallback={(error, resetError) => (
 *     <div>
 *       <p>Error: {error.message}</p>
 *       <button onClick={resetError}>Reintentar</button>
 *     </div>
 *   )}
 * >
 *   <MiComponente />
 * </ErrorBoundary>
 */

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** UI a mostrar cuando hay error. Puede ser componente o render prop */
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log para debugging (en producción enviar a servicio de monitoreo)
    console.error('[ErrorBoundary] Error capturado:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;
      
      // Render prop: fallback es función
      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.resetError);
      }
      
      // Componente personalizado
      if (fallback) {
        return fallback;
      }
      
      // Fallback por defecto
      return <DefaultErrorFallback error={this.state.error} onReset={this.resetError} />;
    }

    return this.props.children;
  }
}

/**
 * Fallback por defecto cuando no se proporciona uno personalizado
 */
interface DefaultErrorFallbackProps {
  error: Error;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="w-16 h-16 border-2 border-destructive rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      
      <h2 className="text-xl font-bold mb-2">Algo salió mal</h2>
      
      <p className="text-muted-foreground mb-4 max-w-md">
        Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
      </p>
      
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs text-left bg-muted p-4 rounded mb-4 max-w-lg overflow-auto">
          {error.message}
        </pre>
      )}
      
      <div className="flex gap-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground font-bold hover:bg-accent transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Reintentar
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
        >
          Recargar página
        </button>
      </div>
    </div>
  );
}
