import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState, type FormEvent } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import {
  formatSlug,
  isValidPersonName,
  isValidPhoneBR,
  onlyDigits,
} from '@/lib/field-formatters'
import { createAvailability } from '@/features/scheduling/services/scheduling.service'
import type { CreateAvailabilityDto } from '@/features/scheduling/types/scheduling.types'

import { createMember, listSpecialties } from '../services/team.service'
import type { CreateMemberDto, MemberRole, Specialty } from '../types/team.types'

export type CreateMemberFormState = {
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

const EMPTY_FORM: CreateMemberFormState = {
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

export function useCreateMemberPage() {
  const navigate = useNavigate()
  const { showAlert } = useGlobalAlerts()

  const [form, setForm] = useState<CreateMemberFormState>(EMPTY_FORM)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [availability, setAvailability] = useState<CreateAvailabilityDto[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayNameTouched = useRef(false)
  const slugTouched = useRef(false)

  useEffect(() => {
    listSpecialties()
      .then(setSpecialties)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (displayNameTouched.current) return

    const auto = [form.firstName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(' ')
    setForm((prev) => ({ ...prev, displayName: auto }))
  }, [form.firstName, form.lastName])

  useEffect(() => {
    if (slugTouched.current) return

    setForm((prev) => ({
      ...prev,
      slug: prev.displayName ? formatSlug(prev.displayName) : '',
    }))
  }, [form.displayName])

  function set<K extends keyof CreateMemberFormState>(
    field: K,
    value: CreateMemberFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleDisplayNameChange(value: string) {
    displayNameTouched.current = true
    set('displayName', value)
  }

  function handleSlugChange(value: string) {
    slugTouched.current = true
    set('slug', formatSlug(value))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
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
        setError(
          'Telefone inválido. Informe um número com DDD e 10 ou 11 dígitos no total.',
        )
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

      const response = await createMember(dto)
      let availabilityError = false

      if (form.role === 'DENTIST' && response.profile && availability.length > 0) {
        try {
          await Promise.all(
            availability.map((slot) => createAvailability(response.profile!.id, slot)),
          )
        } catch {
          availabilityError = true
        }
      }

      showAlert({
        title: availabilityError
          ? 'Profissional cadastrado sem horários'
          : form.role === 'DENTIST'
            ? 'Profissional adicionado'
            : 'Assistente adicionado',
        description: availabilityError
          ? 'O cadastro foi salvo, mas não foi possível salvar a disponibilidade inicial.'
          : `${form.firstName} ${form.lastName} foi cadastrado com sucesso.`,
        tone: availabilityError ? 'warning' : 'success',
      })

      await navigate({ to: '/app/equipe' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar membro.'
      setError(msg)
      showAlert({ title: 'Erro ao cadastrar membro', description: msg, tone: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    set,
    specialties,
    availability,
    setAvailability,
    isSubmitting,
    error,
    isProfessional: form.role === 'DENTIST',
    handleDisplayNameChange,
    handleSlugChange,
    handleSubmit,
  }
}
