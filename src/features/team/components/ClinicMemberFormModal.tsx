import { Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { FormField } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { PasswordInput } from '@/components/common/PasswordInput'
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
import { AvailabilityManager } from '@/features/scheduling/components/availability/AvailabilityManager'
import { ExceptionManager } from '@/features/scheduling/components/availability/ExceptionManager'
import {
  listAvailability,
  listAvailabilityExceptions,
} from '@/features/scheduling/services/scheduling.service'
import type {
  Availability,
  AvailabilityException,
} from '@/features/scheduling/types/scheduling.types'
import { onlyDigits } from '@/lib/field-formatters'
import { isValidBrazilianPhone } from '@/lib/validators/br'

import { createMember, updateClinicMember } from '../services/team.service'
import type { MemberListItem, MemberRole } from '../types/team.types'
import { MemberTypeSelector } from './MemberTypeSelector'

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

export function ClinicMemberFormModal({
  open,
  initialData,
  onClose,
  onSuccess,
}: ClinicMemberFormModalProps) {
  const isEditMode = Boolean(initialData)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const profileId = initialData?.profile?.id
  const canManageAvailability = isEditMode && form.role === 'DENTIST' && Boolean(profileId)

  useEffect(() => {
    if (!open) return
    setError(null)
    setPhoneError(null)
    setForm(initialData ? buildInitialForm(initialData) : EMPTY_FORM)
  }, [initialData, open])

  useEffect(() => {
    if (!open || !profileId) {
      setAvailability([])
      setExceptions([])
      setIsAvailabilityLoading(false)
      return
    }
    setIsAvailabilityLoading(true)
    Promise.all([listAvailability(profileId), listAvailabilityExceptions(profileId)])
      .then(([avail, excs]) => {
        setAvailability(avail)
        setExceptions(excs)
      })
      .catch((err) => {
        const msg =
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os horários do profissional.'
        setError(msg)
      })
      .finally(() => setIsAvailabilityLoading(false))
  }, [open, profileId])

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setPhoneError(null)

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Nome, sobrenome e e-mail são obrigatórios.')
      return
    }

    if (!isEditMode && form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    const rawPhone = onlyDigits(form.phone)
    if (rawPhone && !isValidBrazilianPhone(rawPhone)) {
      setPhoneError('Informe um telefone válido com DDD.')
      return
    }

    setIsSubmitting(true)
    try {
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
          className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-2xl max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          {/* Header */}
          <div className="shrink-0 border-b border-border px-6 py-5">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {isEditMode ? 'Editar membro' : 'Novo membro'}
            </Dialog.Title>
            <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
              {isEditMode
                ? `Atualize os dados de ${initialData!.firstName} ${initialData!.lastName}.`
                : 'Adicione um profissional ou assistente à clínica.'}
            </Dialog.Description>
          </div>

          {/* Scrollable body */}
          <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto">
            <form id="clinic-member-form" onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
              {error && <InlineFeedback tone="error">{error}</InlineFeedback>}

              {/* Tipo de membro */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Tipo de membro
                </p>
                <MemberTypeSelector value={form.role} onChange={(role) => set('role', role)} />
              </div>

              {/* Dados do membro */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Dados do membro
                </p>
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
                <UserPhoneField
                  fieldPrefix="member"
                  phone={form.phone}
                  onPhoneChange={(value) => {
                    set('phone', value)
                    setPhoneError(null)
                  }}
                  phoneError={phoneError}
                />
                {isEditMode && (
                  <FormField label="Status da conta" htmlFor="memberIsActive">
                    <Select value={form.isActive} onValueChange={(value) => set('isActive', value)}>
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

              {/* Senha de acesso — create mode only */}
              {!isEditMode && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Senha de acesso
                  </p>
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
                </div>
              )}
            </form>

            {/* Disponibilidade — edit + DENTIST + hasProfile */}
            {canManageAvailability && (
              <div className="space-y-5 border-t border-border px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Disponibilidade
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Alterações de horários e exceções são salvas automaticamente.
                  </p>
                </div>
                {isAvailabilityLoading ? (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Carregando horários...
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AvailabilityManager
                      profileId={profileId!}
                      slots={availability}
                      onSlotsChange={setAvailability}
                    />
                    <div className="border-t border-border pt-5">
                      <ExceptionManager
                        profileId={profileId!}
                        exceptions={exceptions}
                        onExceptionsChange={setExceptions}
                        title="Exceções de agenda"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* No-profile notice — edit + DENTIST + no profile */}
            {isEditMode && form.role === 'DENTIST' && !profileId && (
              <div className="px-6 pb-5">
                <div className="rounded-lg border border-dashed border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                  Disponibilidade não configurada para este profissional.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" form="clinic-member-form" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isSubmitting ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar membro'}
            </Button>
          </div>
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
