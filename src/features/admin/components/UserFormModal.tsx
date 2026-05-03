import { Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useState, useEffect } from 'react'

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
import { isValidPersonName, isValidPhoneBR, onlyDigits } from '@/lib/field-formatters'

import { createAdminUser, listAdminClinics, updateAdminUser } from '../services/admin-users.service'
import type { AdminClinic, AdminUser, UserRole } from '../types/admin.types'

type Props = {
  open: boolean
  initialData?: AdminUser
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

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Admin (plataforma)' },
  { value: 'OWNER', label: 'Proprietário' },
  { value: 'DENTIST', label: 'Profissional' },
  { value: 'ASSISTANT', label: 'Assistente' },
  { value: 'PATIENT', label: 'Paciente' },
]

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

export function UserFormModal({ open, initialData, onClose, onSuccess }: Props) {
  const isEditMode = !!initialData
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clinics, setClinics] = useState<AdminClinic[]>([])
  const [isClinicsLoading, setIsClinicsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialData ? buildInitialForm(initialData) : EMPTY_FORM)
      setError(null)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

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

    if (form.phone && !isValidPhoneBR(form.phone)) {
      setError('Telefone inválido. Informe um número com DDD e 10 ou 11 dígitos no total.')
      return
    }

    if (!isEditMode && form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (showClinicId && !form.clinicId) {
      setError('Selecione a clínica para este papel.')
      return
    }

    setIsSubmitting(true)

    try {
      const rawPhone = onlyDigits(form.phone)
      let result: AdminUser
      if (isEditMode) {
        result = await updateAdminUser(initialData!.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: rawPhone || undefined,
          role: form.role as UserRole,
          isActive: form.isActive === 'true',
          clinicId: showClinicId ? form.clinicId || undefined : null,
        })
      } else {
        result = await createAdminUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role as UserRole,
          phone: rawPhone || undefined,
          clinicId: showClinicId ? form.clinicId || undefined : undefined,
        })
      }
      onSuccess(result)
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
          aria-labelledby="user-form-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="border-b border-slate-100 px-6 py-5">
            <Dialog.Title
              id="user-form-title"
              className="text-base font-semibold text-slate-950"
            >
              {isEditMode ? 'Editar usuário' : 'Novo usuário'}
            </Dialog.Title>
            <Dialog.Description className="mt-0.5 text-sm text-slate-500">
              {isEditMode
                ? `Alterando dados de ${initialData!.firstName} ${initialData!.lastName}`
                : 'Preencha os dados para criar um novo usuário na plataforma.'}
            </Dialog.Description>
          </div>

          <form id="user-form" onSubmit={handleSubmit}>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {error && <InlineFeedback>{error}</InlineFeedback>}

                <UserNameFields
                  firstName={form.firstName}
                  lastName={form.lastName}
                  onFirstNameChange={(value) => set('firstName', value)}
                  onLastNameChange={(value) => set('lastName', value)}
                />

                <UserEmailField
                  email={form.email}
                  onEmailChange={(value) => set('email', value)}
                />

                {!isEditMode && (
                  <FormField
                    label="Senha"
                    htmlFor="password"
                    hint="Mínimo 8 caracteres, máximo 72."
                  >
                    <PasswordInput
                      id="password"
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      maxLength={72}
                    />
                  </FormField>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Papel" htmlFor="role">
                    <Select
                      value={form.role}
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
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <UserPhoneField
                    phone={form.phone}
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
                            isClinicsLoading ? 'Carregando clínicas...' : 'Selecionar clínica'
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
                  <FormField label="Status da conta" htmlFor="isActive">
                    <Select
                      value={form.isActive}
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

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" form="user-form" disabled={isSubmitting}>
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
