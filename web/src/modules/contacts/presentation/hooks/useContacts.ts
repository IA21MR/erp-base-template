'use client';

/**
 * Mutaciones del módulo Contacts
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsRepository } from '../../infrastructure/repositories';
import { CONTACTS_SEARCH_QUERY_KEY } from './useContactsSearch';
import type { Contact } from '../../domain/types';
import type {
  ContactFormData,
  ContactEmailFormData,
  ContactPhoneFormData,
  ContactAddressFormData,
} from '../../application/validations/contact.schema';

export function useContacts() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [CONTACTS_SEARCH_QUERY_KEY] });

  const createMutation = useMutation({
    mutationFn: (data: ContactFormData) => contactsRepository.create(data),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactFormData }) =>
      contactsRepository.update(id, data),
    onSuccess: invalidate,
  });
  const activateMutation = useMutation({
    mutationFn: (id: string) => contactsRepository.activate(id),
    onSuccess: invalidate,
  });
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => contactsRepository.deactivate(id),
    onSuccess: invalidate,
  });
  const assignMutation = useMutation({
    mutationFn: ({ id, assignedToUserId }: { id: string; assignedToUserId: number | null }) =>
      contactsRepository.assign(id, assignedToUserId),
    onSuccess: invalidate,
  });

  // roles
  const addRoleMutation = useMutation({
    mutationFn: ({ id, roleTypeId }: { id: string; roleTypeId: string }) =>
      contactsRepository.addRole(id, roleTypeId),
    onSuccess: invalidate,
  });
  const removeRoleMutation = useMutation({
    mutationFn: ({ id, roleId }: { id: string; roleId: string }) =>
      contactsRepository.removeRole(id, roleId),
    onSuccess: invalidate,
  });

  // emails
  const addEmailMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactEmailFormData }) =>
      contactsRepository.addEmail(id, data),
    onSuccess: invalidate,
  });
  const removeEmailMutation = useMutation({
    mutationFn: ({ id, emailId }: { id: string; emailId: string }) =>
      contactsRepository.removeEmail(id, emailId),
    onSuccess: invalidate,
  });
  const setPrimaryEmailMutation = useMutation({
    mutationFn: ({ id, emailId }: { id: string; emailId: string }) =>
      contactsRepository.setPrimaryEmail(id, emailId),
    onSuccess: invalidate,
  });

  // phones
  const addPhoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactPhoneFormData }) =>
      contactsRepository.addPhone(id, data),
    onSuccess: invalidate,
  });
  const removePhoneMutation = useMutation({
    mutationFn: ({ id, phoneId }: { id: string; phoneId: string }) =>
      contactsRepository.removePhone(id, phoneId),
    onSuccess: invalidate,
  });
  const setPrimaryPhoneMutation = useMutation({
    mutationFn: ({ id, phoneId }: { id: string; phoneId: string }) =>
      contactsRepository.setPrimaryPhone(id, phoneId),
    onSuccess: invalidate,
  });

  // addresses
  const addAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContactAddressFormData }) =>
      contactsRepository.addAddress(id, data),
    onSuccess: invalidate,
  });
  const removeAddressMutation = useMutation({
    mutationFn: ({ id, addressId }: { id: string; addressId: string }) =>
      contactsRepository.removeAddress(id, addressId),
    onSuccess: invalidate,
  });
  const setPrimaryAddressMutation = useMutation({
    mutationFn: ({ id, addressId }: { id: string; addressId: string }) =>
      contactsRepository.setPrimaryAddress(id, addressId),
    onSuccess: invalidate,
  });

  const toggleActive = async (c: Contact) => {
    if (c.active) await deactivateMutation.mutateAsync(c.id);
    else await activateMutation.mutateAsync(c.id);
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    activateMutation.isPending ||
    deactivateMutation.isPending ||
    assignMutation.isPending ||
    addRoleMutation.isPending ||
    removeRoleMutation.isPending ||
    addEmailMutation.isPending ||
    removeEmailMutation.isPending ||
    setPrimaryEmailMutation.isPending ||
    addPhoneMutation.isPending ||
    removePhoneMutation.isPending ||
    setPrimaryPhoneMutation.isPending ||
    addAddressMutation.isPending ||
    removeAddressMutation.isPending ||
    setPrimaryAddressMutation.isPending;

  return {
    isLoading,
    createContact: (d: ContactFormData) => createMutation.mutateAsync(d),
    updateContact: (id: string, d: ContactFormData) =>
      updateMutation.mutateAsync({ id, data: d }),
    toggleActive,
    assign: (id: string, assignedToUserId: number | null) =>
      assignMutation.mutateAsync({ id, assignedToUserId }),
    addRole: (id: string, roleTypeId: string) =>
      addRoleMutation.mutateAsync({ id, roleTypeId }),
    removeRole: (id: string, roleId: string) =>
      removeRoleMutation.mutateAsync({ id, roleId }),
    addEmail: (id: string, data: ContactEmailFormData) =>
      addEmailMutation.mutateAsync({ id, data }),
    removeEmail: (id: string, emailId: string) =>
      removeEmailMutation.mutateAsync({ id, emailId }),
    setPrimaryEmail: (id: string, emailId: string) =>
      setPrimaryEmailMutation.mutateAsync({ id, emailId }),
    addPhone: (id: string, data: ContactPhoneFormData) =>
      addPhoneMutation.mutateAsync({ id, data }),
    removePhone: (id: string, phoneId: string) =>
      removePhoneMutation.mutateAsync({ id, phoneId }),
    setPrimaryPhone: (id: string, phoneId: string) =>
      setPrimaryPhoneMutation.mutateAsync({ id, phoneId }),
    addAddress: (id: string, data: ContactAddressFormData) =>
      addAddressMutation.mutateAsync({ id, data }),
    removeAddress: (id: string, addressId: string) =>
      removeAddressMutation.mutateAsync({ id, addressId }),
    setPrimaryAddress: (id: string, addressId: string) =>
      setPrimaryAddressMutation.mutateAsync({ id, addressId }),
  };
}
