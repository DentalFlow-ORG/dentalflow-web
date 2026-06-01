import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProfile, listProfiles } from '../../services/profiles.service'
import type { ProfileListItem, ProfileService } from '../../types/profile.types'
import { formatDateInputValue } from '@/lib/date-time-formatters'
import {
  getCurrentTimeInputValue,
  isDateAvailable,
  reaisToCents,
} from '../../utils/appointment-form-utils'
import {
  WHATSAPP_PHONE_REQUIRED_MESSAGE,
  formatPhoneBR,
  isValidWhatsappPhoneBR,
} from '@/lib/field-formatters'

import {
  createAppointment,
  getAvailableSlots,
  listAvailability,
  listAvailabilityExceptions,
} from '../../services/scheduling.service'
import { upsertPatientAvatar } from '@/features/patients/services/patients.service'
import { PatientAvatarWidget } from '@/features/patients/components/PatientAvatarWidget'
import type {
  Appointment,
  Availability,
  AvailabilityException,
  AvailabilitySlot,
  CreateAppointmentDto,
} from '../../types/scheduling.types'
import { SlotPicker } from './SlotPicker'

type CreateAppointmentModalProps = {
  open: boolean
  onClose: () => void
  onCreated: (appointment: Appointment) => void
  fixedProfile?: ProfileListItem | null
}

type FormState = {
  profileId: string
  serviceId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  appointmentDate: string
  startTime: string
  notes: string
  estimatedAmount: string
}

const EMPTY_FORM: FormState = {
  profileId: '',
  serviceId: '',
  patientName: '',
  patientEmail: '',
  patientPhone: '',
  appointmentDate: '',
  startTime: '',
  notes: '',
  estimatedAmount: '',
}

export function CreateAppointmentModal({
  open,
  onClose,
  onCreated,
  fixedProfile,
}: CreateAppointmentModalProps) {
  const { showAlert } = useGlobalAlerts()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [pendingAvatarBase64, setPendingAvatarBase64] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [services, setServices] = useState<ProfileService[]>([])
  const [profileAvailability, setProfileAvailability] = useState<Availability[]>([])
  const [profileExceptions, setProfileExceptions] = useState<AvailabilityException[]>([])
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [estimateManuallyEdited, setEstimateManuallyEdited] = useState(false)
  const todayInputValue = formatDateInputValue(new Date())
  const nowTimeInputValue = getCurrentTimeInputValue()

  useEffect(() => {
    if (!open) return
    if (fixedProfile) {
      setProfiles([fixedProfile])
      set('profileId', fixedProfile.id)
      return
    }

    setIsLoadingProfiles(true)
    listProfiles()
      .then(setProfiles)
      .catch(() => {})
      .finally(() => setIsLoadingProfiles(false))
  }, [fixedProfile, open])

  useEffect(() => {
    if (!form.profileId) {
      setServices([])
      setProfileAvailability([])
      setProfileExceptions([])
      return
    }
    Promise.all([
      getProfile(form.profileId).then((p) => p.services.filter((s) => s.isActive)),
      listAvailability(form.profileId),
      listAvailabilityExceptions(form.profileId),
    ])
      .then(([svcs, avail, excs]) => {
        setServices(svcs)
        setProfileAvailability(avail)
        setProfileExceptions(excs)
      })
      .catch(() => {
        setServices([])
        setProfileAvailability([])
        setProfileExceptions([])
      })
  }, [form.profileId])

  useEffect(() => {
    if (estimateManuallyEdited) return
    if (!form.serviceId) {
      set('estimatedAmount', '')
      return
    }
    const service = services.find((s) => s.id === form.serviceId)
    if (service?.priceFrom != null) {
      const cents = Math.round(service.priceFrom * 100)
      set('estimatedAmount', (cents / 100).toFixed(2).replace('.', ','))
    } else {
      set('estimatedAmount', '')
    }
  }, [form.serviceId, services, estimateManuallyEdited])

  useEffect(() => {
    set('startTime', '')
    if (!form.profileId || !form.appointmentDate) {
      setSlots([])
      setIsLoadingSlots(false)
      return
    }
    setIsLoadingSlots(true)
    getAvailableSlots({
      profileId: form.profileId,
      date: form.appointmentDate,
      serviceId: form.serviceId || undefined,
    })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setIsLoadingSlots(false))
  }, [form.profileId, form.appointmentDate, form.serviceId])

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleClose() {
    setForm(EMPTY_FORM)
    setServices([])
    setProfileAvailability([])
    setProfileExceptions([])
    setSlots([])
    setEstimateManuallyEdited(false)
    setPendingAvatarBase64(null)
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.profileId || !form.patientName || !form.appointmentDate || !form.startTime) {
      return
    }
    if (!isValidWhatsappPhoneBR(form.patientPhone)) {
      showAlert({
        title: 'Telefone obrigatório',
        description: WHATSAPP_PHONE_REQUIRED_MESSAGE,
        tone: 'error',
      })
      return
    }
    if (formatDateInputValue(form.appointmentDate) < todayInputValue) {
      showAlert({
        title: 'Data inválida',
        description: 'Escolha uma data de hoje em diante para criar o agendamento.',
        tone: 'error',
      })
      return
    }
    if (
      formatDateInputValue(form.appointmentDate) === todayInputValue &&
      form.startTime < nowTimeInputValue
    ) {
      showAlert({
        title: 'Horário inválido',
        description: 'Para hoje, escolha um horário igual ou posterior ao horário atual.',
        tone: 'error',
      })
      return
    }
    setIsSubmitting(true)
    try {
      const dto: CreateAppointmentDto = {
        profileId: form.profileId,
        serviceId: form.serviceId || undefined,
        patientName: form.patientName.trim(),
        patientEmail: form.patientEmail.trim() || undefined,
        patientPhone: form.patientPhone.trim(),
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        notes: form.notes.trim() || undefined,
        estimatedAmountCents: reaisToCents(form.estimatedAmount),
      }
      const appointment = await createAppointment(dto)

      // Capture avatar before form is cleared by handleClose.
      // The upload is non-blocking — a failure shows a warning but never
      // undoes the appointment that was already persisted.
      const avatarToUpload = pendingAvatarBase64
      const avatarIdentifier = dto.patientEmail ?? dto.patientName

      showAlert({ title: 'Agendamento criado', tone: 'success' })
      onCreated(appointment)
      handleClose()

      if (avatarToUpload) {
        upsertPatientAvatar(avatarIdentifier, avatarToUpload).catch(() => {
          showAlert({
            title: 'Atenção',
            description: 'Agendamento criado, mas a foto do paciente não pôde ser salva.',
            tone: 'warning',
          })
        })
      }
    } catch (err) {
      showAlert({
        title: 'Erro ao criar agendamento',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="create-modal-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 flex flex-col"
          onEscapeKeyDown={handleClose}
          onInteractOutside={handleClose}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <Dialog.Title
              id="create-modal-title"
              className="text-lg font-semibold text-foreground"
            >
              Novo agendamento
            </Dialog.Title>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={handleClose}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form
            id="create-appointment-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-6 space-y-5"
          >
            {/* Dentist */}
            <FormField label="Profissional" htmlFor="profileId">
              <Select
                required
                disabled={Boolean(fixedProfile) || isLoadingProfiles || isSubmitting}
                value={form.profileId}
                onValueChange={(value) => {
                  set('profileId', value)
                  set('serviceId', '')
                  set('appointmentDate', '')
                  set('estimatedAmount', '')
                  setEstimateManuallyEdited(false)
                }}
              >
                <SelectTrigger id="profileId">
                  <SelectValue
                    placeholder={
                      isLoadingProfiles ? 'Carregando...' : 'Selecione um profissional'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Service */}
            <FormField label="Serviço" htmlFor="serviceId" optional>
              <Select
                disabled={!form.profileId || services.length === 0 || isSubmitting}
                value={form.serviceId}
                onValueChange={(value) => set('serviceId', value)}
              >
                <SelectTrigger id="serviceId">
                  <SelectValue
                    placeholder={
                      !form.profileId
                        ? 'Selecione um profissional primeiro'
                        : services.length === 0
                          ? 'Nenhum servico cadastrado'
                          : 'Selecione um servico (opcional)'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      {s.durationMinutes ? ` (${s.durationMinutes} min)` : ''}
                      {s.priceFrom != null
                        ? ` — R$ ${s.priceFrom.toFixed(2).replace('.', ',')}`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Estimated value */}
            <FormField
              label="Valor previsto (R$)"
              htmlFor="estimatedAmount"
              optional
              hint="Preenchido pelo serviço selecionado. Ajuste para desconto ou negociação."
            >
              <TextInput
                id="estimatedAmount"
                inputMode="decimal"
                disabled={isSubmitting}
                placeholder="Ex: 250,00"
                value={form.estimatedAmount}
                onChange={(e) => {
                  set('estimatedAmount', e.target.value)
                  setEstimateManuallyEdited(true)
                }}
              />
              {estimateManuallyEdited && form.serviceId && (() => {
                const svc = services.find((s) => s.id === form.serviceId)
                return svc?.priceFrom != null ? (
                  <button
                    type="button"
                    className="mt-1 text-xs text-primary hover:underline"
                    onClick={() => {
                      const cents = Math.round(svc.priceFrom! * 100)
                      set('estimatedAmount', (cents / 100).toFixed(2).replace('.', ','))
                      setEstimateManuallyEdited(false)
                    }}
                  >
                    Restaurar valor do serviço (R$ {svc.priceFrom.toFixed(2).replace('.', ',')})
                  </button>
                ) : null
              })()}
            </FormField>

            {/* Date */}
            <FormField label="Data" htmlFor="appointmentDate">
              <DatePickerInput
                id="appointmentDate"
                required
                disabled={!form.profileId || isSubmitting}
                value={form.appointmentDate}
                minValue={todayInputValue}
                disabledDate={
                  form.profileId
                    ? (dv) => !isDateAvailable(dv, profileAvailability, profileExceptions)
                    : undefined
                }
                onValueChange={(value) => {
                  set('appointmentDate', formatDateInputValue(value))
                }}
              />
            </FormField>

            {/* Time slots */}
            <FormField label="Horário">
              {!form.profileId || !form.appointmentDate ? (
                <p className="py-2 text-sm text-muted-foreground">
                  {!form.profileId
                    ? 'Selecione um profissional para ver os horários'
                    : 'Selecione uma data para ver os horários'}
                </p>
              ) : (
                <SlotPicker
                  slots={slots}
                  value={form.startTime}
                  onChange={(time) => set('startTime', time)}
                  isLoading={isLoadingSlots}
                  disabled={isSubmitting}
                />
              )}
            </FormField>

            {/* Patient photo — optional; the PUT /patients/avatar fires after
                appointment creation so the patient identifier is confirmed.  */}
            <div className="rounded-xl border border-dashed border-border bg-muted/40 px-4 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Foto do paciente{' '}
                <span className="font-normal normal-case tracking-normal text-muted-foreground/70">
                  (opcional)
                </span>
              </p>
              <div className="flex items-center gap-4">
                <PatientAvatarWidget
                  name={form.patientName}
                  avatarUrl={pendingAvatarBase64}
                  size="lg"
                  onUpload={isSubmitting ? undefined : setPendingAvatarBase64}
                  onError={(msg) =>
                    showAlert({ title: 'Foto inválida', description: msg, tone: 'error' })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  {pendingAvatarBase64
                    ? 'Foto selecionada — será vinculada ao paciente após criar o agendamento.'
                    : 'Clique na foto para selecionar. JPEG, PNG ou WebP · máx. 5 MB.'}
                </p>
              </div>
            </div>

            {/* Patient info */}
            <FormField label="Nome do paciente" htmlFor="patientName">
              <TextInput
                id="patientName"
                required
                maxLength={100}
                disabled={isSubmitting}
                placeholder="Nome completo"
                value={form.patientName}
                onChange={(e) => set('patientName', e.target.value)}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="E-mail" htmlFor="patientEmail" optional>
                <TextInput
                  id="patientEmail"
                  type="email"
                  disabled={isSubmitting}
                  placeholder="email@exemplo.com"
                  value={form.patientEmail}
                  onChange={(e) => set('patientEmail', e.target.value)}
                />
              </FormField>
              <FormField label="Telefone com WhatsApp" htmlFor="patientPhone">
                <TextInput
                  id="patientPhone"
                  type="tel"
                  maxLength={20}
                  required
                  disabled={isSubmitting}
                  placeholder="(11) 99999-9999"
                  value={form.patientPhone}
                  onChange={(e) => set('patientPhone', formatPhoneBR(e.target.value))}
                />
              </FormField>
            </div>

            <FormField label="Observações" htmlFor="notes" optional>
              <TextArea
                id="notes"
                maxLength={2000}
                disabled={isSubmitting}
                placeholder="Anotações internas sobre a consulta..."
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={3}
                className="min-h-0"
              />
            </FormField>
          </form>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="create-appointment-form"
              disabled={isSubmitting || !form.startTime}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Criando...' : 'Criar agendamento'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

