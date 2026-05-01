import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { PanelCard } from '@/components/common/PanelCard'
import { PasswordInput } from '@/components/common/PasswordInput'
import { AppPageHeader } from '@/components/layout/AppPageHeader'
import { Button } from '@/components/ui/button'
import { formatPhoneBR, formatSlug, formatUf, isValidPersonName, isValidPhoneBR, onlyDigits } from '@/lib/field-formatters'

import { createMember, listSpecialties } from '../services/team.service'
import type { CreateMemberDto, MemberRole, Specialty } from '../types/team.types'
import { MemberTypeSelector } from '../components/MemberTypeSelector'
import { SpecialtyPicker } from '../components/SpecialtyPicker'

type FormState = {
  role: MemberRole
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  displayName: string
  slug: string
  crmNumber: string
  crmState: string
  specialtyIds: string[]
}

const EMPTY_FORM: FormState = {
  role: 'DENTIST',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  displayName: '',
  slug: '',
  crmNumber: '',
  crmState: '',
  specialtyIds: [],
}

export function CreateMemberPage() {
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track whether user manually edited displayName and slug
  const displayNameTouched = useRef(false)
  const slugTouched = useRef(false)

  useEffect(() => {
    listSpecialties()
      .then(setSpecialties)
      .catch(() => {})
  }, [])

  // Auto-fill displayName from firstName + lastName
  useEffect(() => {
    if (displayNameTouched.current) return
    const auto = [form.firstName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(' ')
    setForm((prev) => ({ ...prev, displayName: auto }))
  }, [form.firstName, form.lastName])

  // Auto-fill slug from displayName
  useEffect(() => {
    if (slugTouched.current) return
    setForm((prev) => ({
      ...prev,
      slug: prev.displayName ? formatSlug(prev.displayName) : '',
    }))
  }, [form.displayName])

  function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (!isValidPersonName(form.firstName)) {
        setError('O nome não pode conter números ou caracteres especiais.')
        setIsSubmitting(false)
        return
      }

      if (!isValidPersonName(form.lastName)) {
        setError('O sobrenome não pode conter números ou caracteres especiais.')
        setIsSubmitting(false)
        return
      }

      if (form.phone && !isValidPhoneBR(form.phone)) {
        setError('Telefone inválido. Informe um número com DDD e 10 ou 11 dígitos no total.')
        setIsSubmitting(false)
        return
      }

      const rawPhone = onlyDigits(form.phone)

      const dto: CreateMemberDto = {
        role: form.role,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: rawPhone || undefined,
      }

      if (form.role === 'DENTIST') {
        dto.displayName = form.displayName.trim() || undefined
        dto.slug = form.slug.trim() || undefined
        dto.crmNumber = form.crmNumber.trim() || undefined
        dto.crmState = form.crmState.trim() || undefined
        dto.specialtyIds = form.specialtyIds.length > 0 ? form.specialtyIds : undefined
      }

      await createMember(dto)

      showAlert({
        title:
          form.role === 'DENTIST'
            ? 'Profissional adicionado'
            : 'Assistente adicionado',
        description: `${form.firstName} ${form.lastName} foi cadastrado com sucesso.`,
        tone: 'success',
      })

      await navigate({ to: '/app/equipe' })
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erro ao cadastrar membro.'
      setError(msg)
      showAlert({ title: 'Erro ao cadastrar membro', description: msg, tone: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isProfessional = form.role === 'DENTIST'

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AppPageHeader
        eyebrow="Equipe"
        title="Adicionar membro"
        description="Cadastre um profissional ou assistente para a sua clínica."
        action={
          <Button variant="outline" asChild>
            <Link to="/app/equipe">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type selector */}
        <PanelCard>
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            Tipo de membro
          </h2>
          <MemberTypeSelector
            value={form.role}
            onChange={(role) => set('role', role)}
          />
        </PanelCard>

        {/* Personal info */}
        <PanelCard>
          <h2 className="mb-5 text-base font-semibold text-slate-900">
            Dados pessoais
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Nome" htmlFor="firstName">
              <TextInput
                id="firstName"
                required
                minLength={2}
                maxLength={50}
                disabled={isSubmitting}
                placeholder="Ana"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
            </FormField>

            <FormField label="Sobrenome" htmlFor="lastName">
              <TextInput
                id="lastName"
                required
                minLength={2}
                maxLength={50}
                disabled={isSubmitting}
                placeholder="Martins"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </FormField>

            <FormField label="E-mail" htmlFor="email">
              <TextInput
                id="email"
                type="email"
                required
                maxLength={254}
                disabled={isSubmitting}
                placeholder="ana@clinica.com.br"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </FormField>

            <FormField label="Telefone" htmlFor="phone" optional>
              <TextInput
                id="phone"
                type="tel"
                maxLength={20}
                disabled={isSubmitting}
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => set('phone', formatPhoneBR(e.target.value))}
              />
            </FormField>
          </div>

          <div className="mt-5">
            <FormField
              label="Senha de acesso"
              htmlFor="password"
              hint="Mínimo de 8 caracteres. O membro poderá alterar a senha após o primeiro acesso."
            >
              <PasswordInput
                id="password"
                required
                minLength={8}
                maxLength={72}
                disabled={isSubmitting}
                placeholder="Crie uma senha inicial"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </FormField>
          </div>
        </PanelCard>

        {/* Professional profile — only for DENTIST */}
        {isProfessional && (
          <PanelCard>
            <h2 className="mb-5 text-base font-semibold text-slate-900">
              Perfil profissional
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Nome público" htmlFor="displayName">
                <TextInput
                  id="displayName"
                  required={isProfessional}
                  minLength={2}
                  maxLength={100}
                  disabled={isSubmitting}
                  placeholder="Dra. Ana Martins"
                  value={form.displayName}
                  onChange={(e) => {
                    displayNameTouched.current = true
                    set('displayName', e.target.value)
                  }}
                />
              </FormField>

              <FormField
                label="Slug"
                htmlFor="slug"
                hint="Letras minúsculas, números e hífens."
              >
                <TextInput
                  id="slug"
                  required={isProfessional}
                  minLength={3}
                  maxLength={60}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  disabled={isSubmitting}
                  placeholder="dra-ana-martins"
                  value={form.slug}
                  onChange={(e) => {
                    slugTouched.current = true
                    set('slug', formatSlug(e.target.value))
                  }}
                />
              </FormField>

              <FormField label="Nº do registro (CRO/CRM)" htmlFor="crmNumber" optional>
                <TextInput
                  id="crmNumber"
                  maxLength={20}
                  disabled={isSubmitting}
                  placeholder="12345"
                  value={form.crmNumber}
                  onChange={(e) => set('crmNumber', onlyDigits(e.target.value))}
                />
              </FormField>

              <FormField label="UF do registro" htmlFor="crmState" optional>
                <TextInput
                  id="crmState"
                  maxLength={2}
                  disabled={isSubmitting}
                  placeholder="SP"
                  value={form.crmState}
                  onChange={(e) => set('crmState', formatUf(e.target.value))}
                />
              </FormField>
            </div>
          </PanelCard>
        )}

        {/* Specialties — only for DENTIST */}
        {isProfessional && (
          <PanelCard>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                Especialidades
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Selecione as especialidades do profissional. Aparecem no perfil
                público da clínica.
              </p>
            </div>
            <SpecialtyPicker
              specialties={specialties}
              selected={form.specialtyIds}
              onChange={(ids) => set('specialtyIds', ids)}
              disabled={isSubmitting}
            />
          </PanelCard>
        )}

        {error && <InlineFeedback>{error}</InlineFeedback>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link to="/app/equipe">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting
              ? 'Cadastrando...'
              : isProfessional
                ? 'Cadastrar profissional'
                : 'Cadastrar assistente'}
          </Button>
        </div>
      </form>
    </div>
  )
}
