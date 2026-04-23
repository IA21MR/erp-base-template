'use client';

/**
 * Modal tabbed para editar configuración de una organización:
 * regional / fiscal / notificaciones / branding
 */
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Settings } from 'lucide-react';
import { useToast } from '@/shared/presentation/hooks/useToast';
import { extractErrorMessage } from '@/shared/utils';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/components/ui/Dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/presentation/components/ui/Form';
import { Input } from '@/shared/presentation/components/ui/Input';
import { Button } from '@/shared/presentation/components/ui/Button';
import { Checkbox } from '@/shared/presentation/components/ui/Checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/presentation/components/ui/Tabs';

import type { Organization } from '../../domain/types';
import {
  regionalSettingsSchema,
  fiscalSettingsSchema,
  notificationSettingsSchema,
  brandingSettingsSchema,
  type RegionalSettingsFormData,
  type FiscalSettingsFormData,
  type NotificationSettingsFormData,
  type BrandingSettingsFormData,
} from '../../application/validations/organization.schema';
import { useOrganizationModules } from '../hooks/useOrganizationModules';
import { OrganizationModulesTab } from './OrganizationModulesTab';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  onSaveRegional: (data: RegionalSettingsFormData) => Promise<void>;
  onSaveFiscal: (data: FiscalSettingsFormData) => Promise<void>;
  onSaveNotifications: (data: NotificationSettingsFormData) => Promise<void>;
  onSaveBranding: (data: BrandingSettingsFormData) => Promise<void>;
  isLoading?: boolean;
}

export function OrganizationSettingsModal({
  isOpen,
  onClose,
  organization,
  onSaveRegional,
  onSaveFiscal,
  onSaveNotifications,
  onSaveBranding,
  isLoading = false,
}: Props) {
  const { success, error: showError } = useToast();
  const { availableModules, enabledModules, isLoading: modulesLoading, isToggling, toggle } =
    useOrganizationModules(organization?.id ?? null);

  const handleToggleModule = async (moduleName: string, currentlyEnabled: boolean) => {
    try {
      await toggle(moduleName, currentlyEnabled);
      success(currentlyEnabled ? `Módulo "${moduleName}" deshabilitado` : `Módulo "${moduleName}" habilitado`);
    } catch (err) {
      showError(extractErrorMessage(err, 'No se pudo cambiar el módulo'));
    }
  };
  const regionalForm = useForm<RegionalSettingsFormData>({
    resolver: zodResolver(regionalSettingsSchema),
    defaultValues: {
      timezone: 'America/Santiago',
      locale: 'es-CL',
      currency: 'CLP',
      weekStart: 1,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: 'HH:mm',
    },
  });
  const fiscalForm = useForm<FiscalSettingsFormData>({
    resolver: zodResolver(fiscalSettingsSchema),
    defaultValues: { fiscalYearStartMonth: 1, taxRegime: '', economicActivity: '', notes: '' },
  });
  const notifForm = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: { emailFrom: '', emailReplyTo: '', enableEmail: true, enableSms: false },
  });
  const brandForm = useForm<BrandingSettingsFormData>({
    resolver: zodResolver(brandingSettingsSchema),
    defaultValues: { primaryColor: '', secondaryColor: '', logoUrl: '', faviconUrl: '' },
  });

  useEffect(() => {
    if (!organization) return;
    regionalForm.reset(organization.settings.regional);
    fiscalForm.reset({
      fiscalYearStartMonth: organization.settings.fiscal.fiscalYearStartMonth,
      taxRegime: organization.settings.fiscal.taxRegime ?? '',
      economicActivity: organization.settings.fiscal.economicActivity ?? '',
      notes: organization.settings.fiscal.notes ?? '',
    });
    notifForm.reset({
      emailFrom: organization.settings.notifications.emailFrom ?? '',
      emailReplyTo: organization.settings.notifications.emailReplyTo ?? '',
      enableEmail: organization.settings.notifications.enableEmail,
      enableSms: organization.settings.notifications.enableSms,
    });
    brandForm.reset({
      primaryColor: organization.settings.branding.primaryColor ?? '',
      secondaryColor: organization.settings.branding.secondaryColor ?? '',
      logoUrl: organization.settings.branding.logoUrl ?? '',
      faviconUrl: organization.settings.branding.faviconUrl ?? '',
    });
  }, [organization, regionalForm, fiscalForm, notifForm, brandForm]);

  if (!organization) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-2 border-foreground p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 border-b-2 border-foreground sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración — {organization.legalName}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="regional" className="p-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="regional">Regional</TabsTrigger>
            <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="modules">Módulos</TabsTrigger>
          </TabsList>

          {/* Regional */}
          <TabsContent value="regional" className="pt-6">
            <Form {...regionalForm}>
              <form onSubmit={regionalForm.handleSubmit(onSaveRegional)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={regionalForm.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona horaria</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={regionalForm.control}
                    name="locale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Locale</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={regionalForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moneda (ISO-3)</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={3}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={regionalForm.control}
                    name="weekStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inicio de semana (0=Dom, 1=Lun)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={6}
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={regionalForm.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato de fecha</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={regionalForm.control}
                    name="timeFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato de hora</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>Guardar regional</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Fiscal */}
          <TabsContent value="fiscal" className="pt-6">
            <Form {...fiscalForm}>
              <form onSubmit={fiscalForm.handleSubmit(onSaveFiscal)} className="space-y-4">
                <FormField
                  control={fiscalForm.control}
                  name="fiscalYearStartMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mes inicio ejercicio fiscal (1-12)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={12}
                          value={field.value ?? 1}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fiscalForm.control}
                  name="taxRegime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Régimen tributario</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fiscalForm.control}
                  name="economicActivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actividad económica</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fiscalForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>Guardar fiscal</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="pt-6">
            <Form {...notifForm}>
              <form onSubmit={notifForm.handleSubmit(onSaveNotifications)} className="space-y-4">
                <FormField
                  control={notifForm.control}
                  name="emailFrom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email remitente</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={notifForm.control}
                  name="emailReplyTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reply-To</FormLabel>
                      <FormControl><Input type="email" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={notifForm.control}
                  name="enableEmail"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                      </FormControl>
                      <FormLabel className="font-normal">Habilitar email</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={notifForm.control}
                  name="enableSms"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                      </FormControl>
                      <FormLabel className="font-normal">Habilitar SMS</FormLabel>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>Guardar notificaciones</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Branding */}
          <TabsContent value="branding" className="pt-6">
            <Form {...brandForm}>
              <form onSubmit={brandForm.handleSubmit(onSaveBranding)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={brandForm.control}
                    name="primaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color primario (HEX)</FormLabel>
                        <FormControl><Input placeholder="#ff6600" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={brandForm.control}
                    name="secondaryColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color secundario (HEX)</FormLabel>
                        <FormControl><Input placeholder="#222222" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={brandForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={brandForm.control}
                    name="faviconUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Favicon URL</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>Guardar branding</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Módulos */}
          <TabsContent value="modules" className="pt-6">
            <OrganizationModulesTab
              organizationId={organization.id}
              availableModules={availableModules}
              enabledModules={enabledModules}
              isLoading={modulesLoading}
              isToggling={isToggling}
              onToggle={handleToggleModule}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end p-4 border-t-2 border-foreground">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
