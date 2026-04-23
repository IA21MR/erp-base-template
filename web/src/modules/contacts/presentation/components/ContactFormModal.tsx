'use client';

/**
 * Modal Crear / Editar contacto.
 * - Soporta PERSON y COMPANY (discriminador)
 * - Al crear: emails/phones/addresses/roleTypeIds embebidos
 * - Al editar: solo datos básicos; las sub-entidades se manejan en otras UI/endpoints
 */
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2, Plus, Users } from 'lucide-react';

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
import { Textarea } from '@/shared/presentation/components/ui/Textarea';
import { Button } from '@/shared/presentation/components/ui/Button';
import { Checkbox } from '@/shared/presentation/components/ui/Checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/components/ui/Select';

import type { Contact, ContactRoleType } from '../../domain/types';
import {
  contactSchema,
  type ContactFormData,
} from '../../application/validations/contact.schema';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ContactFormData) => Promise<void>;
  contact?: Contact | null;
  defaultOrganizationId?: string;
  roleTypes?: ContactRoleType[];
  isLoading?: boolean;
}

export function ContactFormModal({
  isOpen,
  onClose,
  onSubmit,
  contact,
  defaultOrganizationId,
  roleTypes = [],
  isLoading = false,
}: Props) {
  const isEditing = !!contact;

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      organizationId: defaultOrganizationId ?? '',
      type: 'PERSON',
      personFirstName: '',
      personLastName: '',
      companyLegalName: '',
      companyTradeName: '',
      taxId: '',
      countryCode: 'CL',
      notes: '',
      emails: [],
      phones: [],
      addresses: [],
      roleTypeIds: [],
    },
  });

  const emails = useFieldArray({ control: form.control, name: 'emails' });
  const phones = useFieldArray({ control: form.control, name: 'phones' });
  const addresses = useFieldArray({ control: form.control, name: 'addresses' });

  const type = form.watch('type');

  useEffect(() => {
    if (contact) {
      form.reset({
        organizationId: contact.organizationId,
        type: contact.type,
        personFirstName: contact.personFirstName ?? '',
        personLastName: contact.personLastName ?? '',
        companyLegalName: contact.companyLegalName ?? '',
        companyTradeName: contact.companyTradeName ?? '',
        taxId: contact.taxId ?? '',
        countryCode: contact.countryCode ?? '',
        notes: contact.notes ?? '',
        // En edición los arrays se dejan vacíos; la gestión se hace por sub-endpoints
        emails: [],
        phones: [],
        addresses: [],
        roleTypeIds: [],
      });
    } else {
      form.reset({
        organizationId: defaultOrganizationId ?? '',
        type: 'PERSON',
        personFirstName: '',
        personLastName: '',
        companyLegalName: '',
        companyTradeName: '',
        taxId: '',
        countryCode: 'CL',
        notes: '',
        emails: [],
        phones: [],
        addresses: [],
        roleTypeIds: [],
      });
    }
  }, [contact, defaultOrganizationId, form]);

  const handleSubmit = async (data: ContactFormData) => {
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-2 border-foreground p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-6 border-b-2 border-foreground sticky top-0 bg-background z-10">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" />
            {isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
            {/* Tipo */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Tipo *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as 'PERSON' | 'COMPANY')}
                    disabled={isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERSON">Persona</SelectItem>
                      <SelectItem value="COMPANY">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos PERSON / COMPANY */}
            {type === 'PERSON' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="personFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Nombre *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Apellido</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyLegalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Razón Social *</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyTradeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Nombre Comercial</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Tax ID y país */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="taxId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold">Tax ID</FormLabel>
                    <FormControl><Input placeholder="RUT / NIF" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">País (ISO-2)</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Notas</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Roles — sólo al crear */}
            {!isEditing && roleTypes.length > 0 && (
              <FormField
                control={form.control}
                name="roleTypeIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Roles</FormLabel>
                    <div className="flex flex-wrap gap-3 border p-3">
                      {roleTypes.map((rt) => {
                        const checked = field.value?.includes(rt.id) ?? false;
                        return (
                          <label
                            key={rt.id}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                const current = field.value ?? [];
                                field.onChange(
                                  v
                                    ? [...current, rt.id]
                                    : current.filter((id) => id !== rt.id),
                                );
                              }}
                            />
                            {rt.label}
                          </label>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Emails — sólo al crear */}
            {!isEditing && (
              <div className="border-2 border-foreground p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Emails</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      emails.append({
                        email: '',
                        label: '',
                        isPrimary: emails.fields.length === 0,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Agregar
                  </Button>
                </div>
                {emails.fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 border p-3">
                    <FormField
                      control={form.control}
                      name={`emails.${i}.email`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel className="text-xs">Email *</FormLabel>
                          <FormControl><Input type="email" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`emails.${i}.label`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs">Etiqueta</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-6 flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`emails.${i}.isPrimary`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={!!field.value}
                                onCheckedChange={(v) => {
                                  if (v) {
                                    emails.fields.forEach((_, idx) => {
                                      if (idx !== i) form.setValue(`emails.${idx}.isPrimary`, false);
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
                        onClick={() => emails.remove(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Phones — sólo al crear */}
            {!isEditing && (
              <div className="border-2 border-foreground p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Teléfonos</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      phones.append({
                        phone: '',
                        label: '',
                        isPrimary: phones.fields.length === 0,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Agregar
                  </Button>
                </div>
                {phones.fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 border p-3">
                    <FormField
                      control={form.control}
                      name={`phones.${i}.phone`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-3">
                          <FormLabel className="text-xs">Teléfono *</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`phones.${i}.label`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs">Etiqueta</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-6 flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`phones.${i}.isPrimary`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={!!field.value}
                                onCheckedChange={(v) => {
                                  if (v) {
                                    phones.fields.forEach((_, idx) => {
                                      if (idx !== i) form.setValue(`phones.${idx}.isPrimary`, false);
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
                        onClick={() => phones.remove(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Addresses — sólo al crear */}
            {!isEditing && (
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
                        city: '',
                        region: '',
                        postalCode: '',
                        countryCode: form.getValues('countryCode') || 'CL',
                        isPrimary: addresses.fields.length === 0,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Agregar
                  </Button>
                </div>
                {addresses.fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 border p-3">
                    <FormField
                      control={form.control}
                      name={`addresses.${i}.street`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel className="text-xs">Calle *</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`addresses.${i}.city`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs">Ciudad *</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`addresses.${i}.region`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs">Región</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`addresses.${i}.postalCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">CP</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`addresses.${i}.countryCode`}
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
                      name={`addresses.${i}.label`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-xs">Etiqueta</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="md:col-span-6 flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`addresses.${i}.isPrimary`}
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={!!field.value}
                                onCheckedChange={(v) => {
                                  if (v) {
                                    addresses.fields.forEach((_, idx) => {
                                      if (idx !== i)
                                        form.setValue(`addresses.${idx}.isPrimary`, false);
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
                        onClick={() => addresses.remove(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t-2 border-foreground">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isEditing ? 'Guardar cambios' : 'Crear contacto'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
