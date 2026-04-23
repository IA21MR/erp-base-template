'use client';

/**
 * Tab de gestión de módulos habilitados para una organización.
 */
import { Package, CheckCircle2, XCircle } from 'lucide-react';
import { LoadingSpinner } from '@/shared/presentation/components/ui/LoadingSpinner';
import type { AvailableModule } from '../../infrastructure/schemas/organization.schemas';

interface Props {
  organizationId: string;
  availableModules: AvailableModule[];
  enabledModules: string[];
  isLoading: boolean;
  isToggling: boolean;
  onToggle: (moduleName: string, currentlyEnabled: boolean) => Promise<void>;
}

const MODULE_LABELS: Record<string, string> = {
  contacts: 'Contactos',
  billing: 'Facturación',
  inventory: 'Inventario',
  hr: 'Recursos Humanos',
  crm: 'CRM',
  projects: 'Proyectos',
};

export function OrganizationModulesTab({
  availableModules,
  enabledModules,
  isLoading,
  isToggling,
  onToggle,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (availableModules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Package className="h-10 w-10 mb-3 opacity-40" />
        <p className="text-sm">No hay módulos disponibles en el sistema.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        Activa o desactiva los módulos disponibles para esta organización. Los cambios
        se aplican en el siguiente request del usuario.
      </p>
      {availableModules.map((mod) => {
        const isEnabled = enabledModules.includes(mod.name);
        const label = MODULE_LABELS[mod.name] ?? mod.name;

        return (
          <div
            key={mod.name}
            className="flex items-center justify-between p-4 border-2 border-foreground/10 rounded-lg hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="font-semibold text-sm">{label}</p>
                {mod.description && (
                  <p className="text-xs text-muted-foreground">{mod.description}</p>
                )}
                {mod.version && (
                  <p className="text-xs text-muted-foreground/60">v{mod.version}</p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={isToggling}
              onClick={() => onToggle(mod.name, isEnabled)}
              className="flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEnabled ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-green-700">Habilitado</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Deshabilitado</span>
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
