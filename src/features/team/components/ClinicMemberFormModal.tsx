import { Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { FormField } from '@/components/common/FormField'
import { PasswordInput } from '@/components/common/PasswordInput'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import {
  UserEmailField,
  UserNameFields,
  UserPhoneField,
} from '@/components/common/UserIdentityFields'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { onlyDigits } from '@/lib/field-formatters'

import { createMember, updateClinicMember } from '../services/team.service'
import type { MemberListItem, MemberRole } from '../types/team.types'

type ClinicMemberFormModalProps = {
  open: boolean
  initialData?: MemberListItem
  onClose: () => void
  onSuccess: (member: MemberListItem) => void
}

type FormState = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: MemberRole
  phone: string
  isActive: string
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'DENTIST',
  phone: '',
  isActive: 'true',
}

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'DENTIST', label: 'Profissional' },
  { value: 'ASSISTANT', label: 'Assistente' },
]

export function ClinicMemberFormModal({
  open,
  initialData,
  onClose,
  onSuccess,
}: ClinicMemberFormModalProps) {
  const isEditMode = Boolean(initialData)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    setError(null)
    setForm(initialData ? buildInitialForm(initialData) : EMPTY_FORM)
  }, [initialData, open])

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Nome, sobrenome e e-mail são obrigatórios.')
      return
    }

    if (!isEditMode && form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setIsSubmitting(true)
    try {
      const rawPhone = onlyDigits(form.phone)

      if (isEditMode) {
        const member = await updateClinicMember(initialData!.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          role: form.role,
          phone: rawPhone || undefined,
          isActive: form.isActive === 'true',
        })
        onSuccess(member)
        return
      }

      const response = await createMember({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phone: rawPhone || undefined,
      })
      onSuccess(response.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="clinic-member-form-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="border-b border-slate-100 px-6 py-5">
            <Dialog.Title
              id="clinic-member-form-title"
              className="text-base font-semibold text-slate-950"
            >
              {isEditMode ? 'Editar usuário' : 'Novo usuário'}
            </Dialog.Title>
            <Dialog.Description className="mt-0.5 text-sm text-slate-500">
              {isEditMode
                ? `Alterando dados de ${initialData!.firstName} ${initialData!.lastName}`
                : 'Adicione um profissional ou assistente à clínica.'}
            </Dialog.Description>
          </div>

          <form id="clinic-member-form" onSubmit={handleSubmit}>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {error && <InlineFeedback>{error}</InlineFeedback>}

                <UserNameFields
                  fieldPrefix="member"
                  firstName={form.firstName}
                  lastName={form.lastName}
                  onFirstNameChange={(value) => set('firstName', value)}
                  onLastNameChange={(value) => set('lastName', value)}
                />

                <UserEmailField
                  fieldPrefix="member"
                  email={form.email}
                  onEmailChange={(value) => set('email', value)}
                />

                {!isEditMode && (
                  <FormField
                    label="Senha"
                    htmlFor="memberPassword"
                    hint="Mínimo 8 caracteres, máximo 72."
                  >
                    <PasswordInput
                      id="memberPassword"
                      required
                      minLength={8}
                      maxLength={72}
                      value={form.password}
                      placeholder="Crie uma senha inicial"
                      onChange={(event) => set('password', event.target.value)}
                    />
                  </FormField>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Papel" htmlFor="memberRole">
                    <Select
                      value={form.role}
                      onValueChange={(value) => set('role', value as MemberRole)}
                    >
                      <SelectTrigger id="memberRole">
                        <SelectValue placeholder="Selecione o papel" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <UserPhoneField
                    fieldPrefix="member"
                    phone={form.phone}
                    onPhoneChange={(value) => set('phone', value)}
                  />
                </div>

                {isEditMode && (
                  <FormField label="Status da conta" htmlFor="memberIsActive">
                    <Select
                      value={form.isActive}
                      onValueChange={(value) => set('isActive', value)}
                    >
                      <SelectTrigger id="memberIsActive">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" form="clinic-member-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting
                  ? 'Salvando...'
                  : isEditMode
                    ? 'Salvar alterações'
                    : 'Criar usuário'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function buildInitialForm(member: MemberListItem): FormState {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    password: '',
    role: member.role,
    phone: member.phone ?? '',
    isActive: member.isActive ? 'true' : 'false',
  }
}
