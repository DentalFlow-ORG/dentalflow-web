import { formatPhoneBR } from '@/lib/field-formatters'
import { EMAIL_MAX_LENGTH } from '@/lib/validators/email'

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
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Nome" htmlFor={firstNameId}>
        <TextInput
          id={firstNameId}
          required
          minLength={2}
          maxLength={50}
          value={firstName}
          placeholder="Ana"
          // Staff type another person's data here: never autofill their own.
          autoComplete="off"
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
          autoComplete="off"
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
        inputMode="email"
        required
        maxLength={EMAIL_MAX_LENGTH}
        value={email}
        placeholder="ana@clinica.com.br"
        autoComplete="off"
        onChange={(event) => onEmailChange(event.target.value)}
      />
    </FormField>
  )
}

export function UserPhoneField({
  phone,
  onPhoneChange,
  fieldPrefix = '',
  phoneError,
}: Pick<UserIdentityFieldsProps, 'phone' | 'onPhoneChange' | 'fieldPrefix'> & {
  phoneError?: string | null
}) {
  const fieldId = `${fieldPrefix}phone`
  return (
    <FormField label="Telefone" htmlFor={fieldId} optional error={phoneError}>
      <TextInput
        id={fieldId}
        type="tel"
        inputMode="tel"
        value={formatPhoneBR(phone)}
        placeholder="(11) 99999-9999"
        autoComplete="off"
        onChange={(event) => onPhoneChange(formatPhoneBR(event.target.value))}
        aria-invalid={Boolean(phoneError)}
        aria-describedby={phoneError ? `${fieldId}-error` : undefined}
      />
    </FormField>
  )
}
