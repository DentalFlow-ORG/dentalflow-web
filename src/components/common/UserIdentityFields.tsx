import { formatPhoneBR } from '@/lib/field-formatters'

import { FormField, TextInput } from './FormField'

type UserIdentityFieldsProps = {
  firstName: string
  lastName: string
  email: string
  phone: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  fieldPrefix?: string
}

export function UserNameFields({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  fieldPrefix = '',
}: Pick<
  UserIdentityFieldsProps,
  'firstName' | 'lastName' | 'onFirstNameChange' | 'onLastNameChange' | 'fieldPrefix'
>) {
  const firstNameId = `${fieldPrefix}firstName`
  const lastNameId = `${fieldPrefix}lastName`

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Nome" htmlFor={firstNameId}>
        <TextInput
          id={firstNameId}
          required
          minLength={2}
          maxLength={50}
          value={firstName}
          placeholder="Ana"
          onChange={(event) => onFirstNameChange(event.target.value)}
        />
      </FormField>

      <FormField label="Sobrenome" htmlFor={lastNameId}>
        <TextInput
          id={lastNameId}
          required
          minLength={2}
          maxLength={50}
          value={lastName}
          placeholder="Martins"
          onChange={(event) => onLastNameChange(event.target.value)}
        />
      </FormField>
    </div>
  )
}

export function UserEmailField({
  email,
  onEmailChange,
  fieldPrefix = '',
}: Pick<UserIdentityFieldsProps, 'email' | 'onEmailChange' | 'fieldPrefix'>) {
  return (
    <FormField label="E-mail" htmlFor={`${fieldPrefix}email`}>
      <TextInput
        id={`${fieldPrefix}email`}
        type="email"
        required
        maxLength={254}
        value={email}
        placeholder="ana@clinica.com.br"
        onChange={(event) => onEmailChange(event.target.value)}
      />
    </FormField>
  )
}

export function UserPhoneField({
  phone,
  onPhoneChange,
  fieldPrefix = '',
}: Pick<UserIdentityFieldsProps, 'phone' | 'onPhoneChange' | 'fieldPrefix'>) {
  return (
    <FormField label="Telefone" htmlFor={`${fieldPrefix}phone`} optional>
      <TextInput
        id={`${fieldPrefix}phone`}
        type="tel"
        maxLength={15}
        value={formatPhoneBR(phone)}
        placeholder="(11) 99999-9999"
        onChange={(event) => onPhoneChange(formatPhoneBR(event.target.value))}
      />
    </FormField>
  )
}
