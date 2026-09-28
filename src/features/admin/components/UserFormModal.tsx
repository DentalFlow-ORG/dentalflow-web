import { Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { PasswordInput } from '@/components/common/PasswordInput'
import { PasswordRequirements } from '@/components/common/PasswordRequirements'
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
import { isValidPersonName, normalizePhoneBR } from '@/lib/field-formatters'
import { isValidBrazilianPhone } from '@/lib/validators/br'
import { INVALID_EMAIL_MESSAGE, isValidEmail, normalizeEmail } from '@/lib/validators/email'
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_POLICY_MESSAGE,
  meetsPasswordPolicy,
} from '@/lib/validators/password'

import { ADMIN_ROLE_LABEL, USER_FORM_ROLE_OPTIONS } from '../constants/admin-display'
import { createAdminUser, listAdminClinics, updateAdminUser } from '../services/admin-users.service'
import type { AdminClinic, AdminUser, UserRole } from '../types/admin.types'

type Props = {
  open: boolean
  initialData?: AdminUser
  /** Signed-in admin: their own role and account status cannot be changed here. */
  currentUserId?: string
  onClose: () => void
  onSuccess: (user: AdminUser) => void
}

type FormState = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
  clinicId: string
  phone: string
  isActive: string
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'DENTIST',
  clinicId: '',
  phone: '',
  isActive: 'true',
}

const CLINIC_REQUIRED_ROLES: UserRole[] = ['OWNER', 'DENTIST', 'ASSISTANT']
const PRIVILEGED_ROLES: UserRole[] = ['ADMIN', 'OWNER']

function buildInitialForm(user: AdminUser): FormState {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    role: user.role,
    clinicId: user.clinicId ?? '',
    phone: user.phone ?? '',
    isActive: user.isActive ? 'true' : 'false',
  }
}

// Changes with access/security impact that must be confirmed before saving.
function describeSensitiveChanges(
  form: FormState,
  clinics: AdminClinic[],
  initialData?: AdminUser,
): string[] {
  const role = form.role as UserRole
  const changes: string[] = []

  if (!initialData) {
    if (PRIVILEGED_ROLES.includes(role)) {
      changes.push(`A conta será criada com o papel ${ADMIN_ROLE_LABEL[role]}.`)
    }
    return changes
  }

  if (role !== initialData.role) {
    const promotion = PRIVILEGED_ROLES.includes(role)
      ? ' Este papel concede acesso administrativo ampliado.'
      : ''
    changes.push(
      `O papel muda de ${ADMIN_ROLE_LABEL[initialData.role]} para ${ADMIN_ROLE_LABEL[role]}.${promotion}`,
    )
  }

  const email = normalizeEmail(form.email)
  if (email !== normalizeEmail(initialData.email)) {
    changes.push(`O e-mail de acesso muda de ${initialData.email} para ${email}.`)
  }

  // A clinic move also ends the user's sessions on the API, so it is confirmed
  // like the other access changes. Moving to a clinic-less role is already
  // covered by the role change above.
  const clinicRequired = CLINIC_REQUIRED_ROLES.includes(role)
  if (clinicRequired && form.clinicId && form.clinicId !== initialData.clinicId) {
    const nextClinic =
      clinics.find((clinic) => clinic.id === form.clinicId)?.name ?? 'outra clínica'
    const previousClinic = initialData.clinic?.name ?? 'nenhuma clínica'
    changes.push(`A clínica vinculada muda de ${previousClinic} para ${nextClinic}.`)
  }

  if (initialData.isActive && form.isActive === 'false') {
    changes.push('A conta será desativada e perderá o acesso à plataforma.')
  }

  return changes
}

export function UserFormModal({ open, initialData, currentUserId, onClose, onSuccess }: Props) {
  const isEditMode = !!initialData
  const isSelf = isEditMode && !!currentUserId && initialData.id === currentUserId
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [pendingChanges, setPendingChanges] = useState<string[] | null>(null)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clinics, setClinics] = useState<AdminClinic[]>([])
  const [isClinicsLoading, setIsClinicsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialData ? buildInitialForm(initialData) : EMPTY_FORM)
      setError(null)
      setPhoneError(null)
      setPendingChanges(null)
    }
  }, [open, initialData])

  useEffect(() => {
    if (!open) return
    setIsClinicsLoading(true)
    listAdminClinics()
      .then(setClinics)
      .catch(() => setClinics([]))
      .finally(() => setIsClinicsLoading(false))
  }, [open])

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const showClinicId = CLINIC_REQUIRED_ROLES.includes(form.role as UserRole)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPhoneError(null)

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Nome, sobrenome e e-mail são obrigatórios.')
      return
    }

    if (!isValidPersonName(form.firstName)) {
      setError('O nome não pode conter números ou caracteres especiais.')
      return
    }

    if (!isValidPersonName(form.lastName)) {
      setError('O sobrenome não pode conter números ou caracteres especiais.')
      return
    }

    if (!isValidEmail(form.email)) {
      setError(INVALID_EMAIL_MESSAGE)
      return
    }

    if (form.phone && !isValidBrazilianPhone(form.phone)) {
      setPhoneError('Telefone inválido. Informe um número com DDD e 10 ou 11 dígitos no total.')
      return
    }

    if (!isEditMode && !meetsPasswordPolicy(form.password)) {
      setError(PASSWORD_POLICY_MESSAGE)
      return
    }

    if (showClinicId && !form.clinicId) {
      setError('Selecione a clínica para este papel.')
      return
    }

    const changes = describeSensitiveChanges(form, clinics, initialData)
    if (changes.length > 0) {
      setPendingChanges(changes)
      return
    }

    void persist()
  }

  async function persist() {
    setIsSubmitting(true)

    try {
      const rawPhone = normalizePhoneBR(form.phone)
      let result: AdminUser
      if (isEditMode) {
        result = await updateAdminUser(initialData!.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: normalizeEmail(form.email),
          phone: rawPhone || null,
          role: form.role as UserRole,
          isActive: form.isActive === 'true',
          clinicId: showClinicId ? form.clinicId || undefined : null,
        })
      } else {
        result = await createAdminUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: normalizeEmail(form.email),
          password: form.password,
          role: form.role as UserRole,
          phone: rawPhone || undefined,
          clinicId: showClinicId ? form.clinicId || undefined : undefined,
        })
      }
      setPendingChanges(null)
      onSuccess(result)
    } catch (err) {
      setPendingChanges(null)
      setError(err instanceof Error ? err.message : 'Erro ao salvar usuário.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && !isSubmitting && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="user-form-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
        >
          <div className="border-b border-border px-6 py-5">
            <Dialog.Title id="user-form-title" className="text-base font-semibold text-foreground">
              {isEditMode ? 'Editar usuário' : 'Novo usuário'}
            </Dialog.Title>
            <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
              {isEditMode
                ? `Alterando dados de ${initialData!.firstName} ${initialData!.lastName}`
                : 'Preencha os dados para criar um novo usuário na plataforma.'}
            </Dialog.Description>
          </div>

          <form id="user-form" noValidate onSubmit={handleSubmit}>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {error && <InlineFeedback>{error}</InlineFeedback>}

                <UserNameFields
                  firstName={form.firstName}
                  lastName={form.lastName}
                  onFirstNameChange={(value) => set('firstName', value)}
                  onLastNameChange={(value) => set('lastName', value)}
                />

                <UserEmailField email={form.email} onEmailChange={(value) => set('email', value)} />

                {!isEditMode && (
                  <FormField
                    label="Senha"
                    htmlFor="password"
                    hint="De 8 a 72 caracteres, com maiúscula, minúscula, número e caractere especial."
                  >
                    <PasswordInput
                      id="password"
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="Crie uma senha inicial"
                      autoComplete="new-password"
                      required
                      maxLength={PASSWORD_MAX_LENGTH}
                    />
                    <PasswordRequirements password={form.password} visible={passwordFocused} />
                  </FormField>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Papel"
                    htmlFor="role"
                    hint={isSelf ? 'Você não pode alterar o próprio papel.' : undefined}
                  >
                    <Select
                      value={form.role}
                      disabled={isSelf}
                      onValueChange={(v) => {
                        set('role', v)
                        if (!CLINIC_REQUIRED_ROLES.includes(v as UserRole)) {
                          set('clinicId', '')
                        }
                      }}
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Selecione o papel" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_FORM_ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <UserPhoneField
                    phone={form.phone}
                    phoneError={phoneError}
                    onPhoneChange={(value) => set('phone', value)}
                  />
                </div>

                {showClinicId && (
                  <FormField label="Clínica" htmlFor="clinicId">
                    <Select
                      value={form.clinicId}
                      onValueChange={(v) => set('clinicId', v)}
                      disabled={isClinicsLoading}
                    >
                      <SelectTrigger id="clinicId">
                        <SelectValue
                          placeholder={
                            isClinicsLoading ? 'Carregando clínicas...' : 'Selecione uma clínica'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                        {!isClinicsLoading && clinics.length === 0 && (
                          <SelectItem value="__none__" disabled>
                            Nenhuma clínica encontrada
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}

                {isEditMode && (
                  <FormField
                    label="Status da conta"
                    htmlFor="isActive"
                    hint={isSelf ? 'Você não pode desativar a própria conta.' : undefined}
                  >
                    <Select
                      value={form.isActive}
                      disabled={isSelf}
                      onValueChange={(v) => set('isActive', v)}
                    >
                      <SelectTrigger id="isActive">
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

            <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" form="user-form" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Salvando...' : isEditMode ? 'Salvar alterações' : 'Criar usuário'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>

      <ConfirmDialog
        open={pendingChanges !== null}
        tone="warning"
        title={isEditMode ? 'Confirmar alterações sensíveis' : 'Confirmar criação de conta'}
        subject={`${form.firstName.trim()} ${form.lastName.trim()}`.trim()}
        description={
          <>
            {pendingChanges?.map((change) => (
              <span key={change} className="block">
                {change}
              </span>
            ))}
            {isEditMode && (
              <span className="mt-2 block">
                Alterações de papel, clínica, e-mail ou status encerram as sessões ativas deste
                usuário.
              </span>
            )}
          </>
        }
        confirmLabel={isEditMode ? 'Salvar alterações' : 'Criar usuário'}
        isConfirming={isSubmitting}
        onConfirm={() => void persist()}
        onCancel={() => setPendingChanges(null)}
      />
    </Dialog.Root>
  )
}
