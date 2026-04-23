/**
 * Selector de permisos agrupados por módulo
 * 
 * Muestra los permisos organizados por módulo con checkboxes.
 * Aplica reglas de coherencia: al seleccionar un permiso de acción,
 * sus permisos base se auto-seleccionan. No se puede deseleccionar
 * un permiso base si hay permisos de acción que dependen de él.
 */

'use client';

import { useMemo, useCallback } from 'react';
import { Checkbox } from '@/shared/presentation/components/ui/Checkbox';
import { ScrollArea } from '@/shared/presentation/components/ui/ScrollArea';
import { PERMISSION_DEPENDENCIES } from '@/shared/domain/rules/PermissionDependencyRules';
import type { PermissionsByModule, Permission } from '../../domain/types/role.types';

interface PermissionSelectorProps {
  permissionsByModule: PermissionsByModule[];
  selectedPermissionIds: number[];
  onChange: (permissionIds: number[]) => void;
}

export function PermissionSelector({
  permissionsByModule,
  selectedPermissionIds,
  onChange,
}: PermissionSelectorProps) {
  // Mapas de conversión code ↔ id
  const allPermissions = useMemo(() => {
    const list: Permission[] = [];
    for (const mod of permissionsByModule) {
      list.push(...mod.permissions);
    }
    return list;
  }, [permissionsByModule]);

  const codeToId = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of allPermissions) map.set(p.code, p.id);
    return map;
  }, [allPermissions]);

  const idToCode = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of allPermissions) map.set(p.id, p.code);
    return map;
  }, [allPermissions]);

  /**
   * Dado un conjunto de IDs a seleccionar, agrega los permisos base faltantes
   * para mantener la coherencia de dependencias.
   */
  const addMissingBases = useCallback(
    (ids: number[]): number[] => {
      const result = new Set(ids);
      let changed = true;

      // Iterar hasta estabilizar (posibles dependencias transitivas)
      while (changed) {
        changed = false;
        for (const id of Array.from(result)) {
          const code = idToCode.get(id);
          if (!code) continue;
          const requiredBases = PERMISSION_DEPENDENCIES[code];
          if (!requiredBases) continue;

          const hasBase = requiredBases.some((base) => {
            const baseId = codeToId.get(base);
            return baseId !== undefined && result.has(baseId);
          });

          if (!hasBase) {
            // Auto-agregar el primer permiso base que exista en el catálogo
            for (const base of requiredBases) {
              const baseId = codeToId.get(base);
              if (baseId !== undefined) {
                result.add(baseId);
                changed = true;
                break;
              }
            }
          }
        }
      }

      return Array.from(result);
    },
    [idToCode, codeToId],
  );

  /**
   * Verifica si un permiso puede ser deseleccionado:
   * si otros permisos seleccionados dependen exclusivamente de él como base.
   */
  const canDeselect = useCallback(
    (permissionId: number, currentSelection: number[]): boolean => {
      const code = idToCode.get(permissionId);
      if (!code) return true;

      const selectionWithout = currentSelection.filter((id) => id !== permissionId);
      const remainingCodes = new Set(selectionWithout.map((id) => idToCode.get(id)).filter(Boolean) as string[]);

      for (const id of selectionWithout) {
        const depCode = idToCode.get(id);
        if (!depCode) continue;
        const requiredBases = PERMISSION_DEPENDENCIES[depCode];
        if (!requiredBases) continue;

        // Si este permiso de acción depende del que queremos quitar
        if (requiredBases.includes(code)) {
          // ¿Tiene otro base disponible en la selección restante?
          const hasAlternativeBase = requiredBases.some((base) => remainingCodes.has(base));
          if (!hasAlternativeBase) return false;
        }
      }

      return true;
    },
    [idToCode],
  );

  const handleToggle = (permissionId: number) => {
    if (selectedPermissionIds.includes(permissionId)) {
      // Deseleccionar: solo si no rompe coherencia
      if (!canDeselect(permissionId, selectedPermissionIds)) return;
      onChange(selectedPermissionIds.filter((id) => id !== permissionId));
    } else {
      // Seleccionar: agregar + bases faltantes
      const newIds = addMissingBases([...selectedPermissionIds, permissionId]);
      onChange(newIds);
    }
  };

  const handleToggleModule = (modulePermissions: number[]) => {
    const allSelected = modulePermissions.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      // Desmarcar módulo completo: quitar TODOS los permisos del módulo,
      // ignorando locks (los dependientes también se están quitando).
      const moduleSet = new Set(modulePermissions);
      let current = selectedPermissionIds.filter((id) => !moduleSet.has(id));

      // Cascada iterativa: repetir hasta que no haya más cambios.
      // Necesario para propagaciones multi-nivel entre módulos.
      let changed = true;
      while (changed) {
        changed = false;
        const currentCodes = new Set(
          current.map((id) => idToCode.get(id)).filter(Boolean) as string[],
        );
        const next = current.filter((id) => {
          const code = idToCode.get(id);
          if (!code) return true;
          const required = PERMISSION_DEPENDENCIES[code];
          if (!required) return true;
          return required.some((base) => currentCodes.has(base));
        });
        if (next.length !== current.length) {
          changed = true;
          current = next;
        }
      }

      onChange(current);
    } else {
      // Seleccionar todo el módulo + bases faltantes
      const merged = new Set([...selectedPermissionIds, ...modulePermissions]);
      onChange(addMissingBases(Array.from(merged)));
    }
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        {permissionsByModule.map((module) => {
          const modulePermissionIds = module.permissions.map((p) => p.id);
          const allSelected = modulePermissionIds.every((id) => selectedPermissionIds.includes(id));
          const someSelected = modulePermissionIds.some((id) => selectedPermissionIds.includes(id));

          return (
            <div key={module.module} className="space-y-3">
              {/* Header del módulo */}
              <div className="flex items-center gap-2 pb-2 border-b-2 border-foreground">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => handleToggleModule(modulePermissionIds)}
                  className={someSelected && !allSelected ? 'data-[state=checked]:bg-blue-500' : ''}
                />
                <div className="flex items-center gap-2">
                  <span className="text-lg">📋</span>
                  <span className="font-bold text-sm">Módulo: {module.module}</span>
                </div>
              </div>

              {/* Lista de permisos del módulo */}
              <div className="space-y-2 pl-6">
                {module.permissions.map((permission) => {
                  const isSelected = selectedPermissionIds.includes(permission.id);
                  const isLocked = isSelected && !canDeselect(permission.id, selectedPermissionIds);

                  return (
                    <div key={permission.id} className="flex items-start gap-2">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(permission.id)}
                        id={`permission-${permission.id}`}
                        disabled={isLocked}
                      />
                      <label
                        htmlFor={`permission-${permission.id}`}
                        className="text-sm leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        <span className="font-medium">{permission.code}</span>
                        {permission.description && (
                          <span className="text-muted-foreground"> - {permission.description}</span>
                        )}
                        {isLocked && (
                          <span className="text-xs text-amber-600 ml-1">(requerido por otros permisos)</span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
