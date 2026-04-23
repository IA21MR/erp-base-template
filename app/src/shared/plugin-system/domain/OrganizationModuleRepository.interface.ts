/**
 * Repositorio para consultar/modificar el estado de módulos por organización.
 */
export interface OrganizationModuleRepository {
  isEnabled(organizationId: string, moduleName: string): Promise<boolean>;
  listEnabled(organizationId: string): Promise<string[]>;
  enable(organizationId: string, moduleName: string): Promise<void>;
  disable(organizationId: string, moduleName: string): Promise<void>;
  enableMany(organizationId: string, moduleNames: string[]): Promise<void>;
}
