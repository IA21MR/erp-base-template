export interface AddressInput {
  street: string;
  city: string;
  region?: string | null;
  postalCode?: string | null;
  countryCode: string;
  label?: string | null;
  isPrimary?: boolean;
}

export interface EmailInput {
  email: string;
  label?: string | null;
  isPrimary?: boolean;
}

export interface PhoneInput {
  phone: string;
  label?: string | null;
  isPrimary?: boolean;
}

export interface CreateContactCommand {
  organizationId: string;
  type: 'PERSON' | 'COMPANY';
  personFirstName?: string;
  personLastName?: string;
  companyLegalName?: string;
  companyTradeName?: string | null;
  taxId?: string | null;
  countryCode?: string | null;
  notes?: string | null;
  userId?: number | null;
  assignedToUserId?: number | null;
  emails?: EmailInput[];
  phones?: PhoneInput[];
  addresses?: AddressInput[];
  roleTypeIds?: string[];
}

export interface UpdateContactCommand {
  id: string;
  personFirstName?: string;
  personLastName?: string;
  companyLegalName?: string;
  companyTradeName?: string | null;
  taxId?: string | null;
  countryCode?: string | null;
  notes?: string | null;
  userId?: number | null;
}

export interface AddContactRoleCommand {
  contactId: string;
  roleTypeId: string;
  since?: Date | null;
  until?: Date | null;
}
export interface RemoveContactRoleCommand {
  contactId: string;
  roleId: string;
}

export interface AddContactEmailCommand extends EmailInput {
  contactId: string;
}
export interface UpdateContactEmailCommand {
  contactId: string;
  emailId: string;
  email?: string;
  label?: string | null;
}
export interface RemoveContactEmailCommand { contactId: string; emailId: string }
export interface SetPrimaryContactEmailCommand { contactId: string; emailId: string }

export interface AddContactPhoneCommand extends PhoneInput {
  contactId: string;
}
export interface UpdateContactPhoneCommand {
  contactId: string;
  phoneId: string;
  phone?: string;
  label?: string | null;
}
export interface RemoveContactPhoneCommand { contactId: string; phoneId: string }
export interface SetPrimaryContactPhoneCommand { contactId: string; phoneId: string }

export interface AddContactAddressCommand extends AddressInput {
  contactId: string;
}
export interface UpdateContactAddressCommand {
  contactId: string;
  addressId: string;
  street?: string;
  city?: string;
  region?: string | null;
  postalCode?: string | null;
  countryCode?: string;
  label?: string | null;
}
export interface RemoveContactAddressCommand { contactId: string; addressId: string }
export interface SetPrimaryContactAddressCommand { contactId: string; addressId: string }

export interface AssignContactCommand {
  contactId: string;
  assignedToUserId: number | null;
}

export interface ListContactsCommand {
  page?: number;
  perPage?: number;
  organizationId?: string;
  type?: 'PERSON' | 'COMPANY';
  active?: boolean;
  roleTypeId?: string;
  assignedToUserId?: number;
  query?: string;
}

export interface SearchContactsCommand {
  query: string;
  page?: number;
  perPage?: number;
}
