'use client';

/**
 * Modal para crear o editar una organización (incluye direcciones).
 */
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Plus, Trash2 } from 'lucide-react';

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

import type { Organization } from '../../domain/types';
import {
  organizationSchema,
  type OrganizationFormData,
} from '../../application/validations/organization.schema';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OrganizationFormData) => Promise<void>;
  organization?: Organization | null;
  isLoading?: boolean;
}

export function OrganizationFormModal({
  isOpen,
  onClose,
  onSubmit,
  organization,
  isLoading = false,
}: Props) {
  const isEditing = !!organization;

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      legalName: '',
      tradeName: '',
      taxId: '',
      countryCode: 'CL',
      email: '',
      phone: '',
      website: '',
      addresses: [],
    },
  });

  const addresses = useFieldArray({ control: form.control, name: 'addresses' });

  useEffect(() => {
    if (organization) {
      form.reset({
        legalName: organization.legalName,
        tradeName: organization.tradeName ?? '',
        taxId: organization.taxId ?? '',
        countryCode: organization.countryCode,
        email: organization.email ?? '',
        phone: organization.phone ?? '',
        website: organization.website ?? '',
        addresses: organization.addresses.map((a) => ({
          id: a.id,
          label: a.label ?? '',
          street: a.street,
          street2: a.street2 ?? '',
          city: a.city ?? '',
          state: a.state ?? '',
          postalCode: a.postalCode ?? '',
          countryCode: a.countryCode,
          isPrimary: a.isPrimary,
        })),
      });
    } else {
      form.reset({
        legalName: '',
        tradeName: '',
        taxId: '',
        countryCode: 'CL',
        email: '',
        phone: '',
        website: '',
        addresses: [],
      });
    }
  }, [organization, form]);

  const handleSubmit = async (data: OrganizationFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-2 border-foreground p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 border-b-2 border-foreground sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isEditing ? 'Editar Organización' : 'Nueva Organización'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Razón Social *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mi Empresa SpA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tradeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Nombre Comercial</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Mi Empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Tax ID *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="RUT / NIF"
                        {...field}
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">País (ISO-2) *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="CL"
                        maxLength={2}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        disabled={isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contacto@empresa.cl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+56 9 1234 5678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold">Sitio Web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Direcciones */}
            <div className="border-2 border-foreground p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">Direcciones</h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    addresses.append({
                      label: '',
                      street: '',
                      street2: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      countryCode: form.getValues('countryCode'),
                      isPrimary: addresses.fields.length === 0,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Agregar
                </Button>
              </div>
              {addresses.fields.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin direcciones registradas.</p>
              )}
              {addresses.fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 border p-3">
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.label`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs">Etiqueta</FormLabel>
                        <FormControl>
                          <Input placeholder="Casa Matriz" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.street`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-3">
                        <FormLabel className="text-xs">Calle *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.countryCode`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">País</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={2}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.city`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs">Ciudad</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.state`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs">Región</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addresses.${index}.postalCode`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">CP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-6 flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name={`addresses.${index}.isPrimary`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={(v) => {
                                // Sólo una primaria permitida
                                if (v) {
                                  addresses.fields.forEach((_, i) => {
                                    if (i !== index) form.setValue(`addresses.${i}.isPrimary`, false);
                                  });
                                }
                                field.onChange(!!v);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">Principal</FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addresses.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t-2 border-foreground">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEditing ? 'Guardar cambios' : 'Crear organización'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
