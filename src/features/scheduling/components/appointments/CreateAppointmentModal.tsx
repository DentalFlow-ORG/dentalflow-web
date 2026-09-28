import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { formatDateInputValue } from '@/lib/date-time-formatters'
import {
  WHATSAPP_PHONE_REQUIRED_MESSAGE,
  formatPhoneBR,
  isValidWhatsappPhoneBR,
  normalizePhoneBR,
} from '@/lib/field-formatters'
import { EMAIL_MAX_LENGTH, INVALID_EMAIL_MESSAGE, isValidEmail } from '@/lib/validators/email'
import {
  APPOINTMENT_FIELD_MESSAGES,
  APPOINTMENT_NOTES_MAX_LENGTH,
  PATIENT_NAME_MAX_LENGTH,
  PATIENT_PHONE_MAX_LENGTH,
} from '../../constants/appointment-form'
import { getProfile, listProfiles } from '../../services/profiles.service'
import type { ProfileListItem, ProfileService } from '../../types/profile.types'
import {
  getCurrentTimeInputValue,
  isDateAvailable,
  moneyInputToOptionalCents,
  servicePriceToMoneyInput,
} from '../../utils/appointment-form-utils'

import { PatientAvatarWidget } from '@/features/patients/components/PatientAvatarWidget'
import { upsertPatientAvatar } from '@/features/patients/services/patients.service'
import type { PatientSummary } from '@/features/patients/types/patients.types'
import {
  createAppointment,
  getAvailableSlots,
  listAvailability,
  listAvailabilityExceptions,
} from '../../services/scheduling.service'
import type {
  Appointment,
  Availability,
  AvailabilityException,
  AvailabilitySlot,
  CreateAppointmentDto,
} from '../../types/scheduling.types'
import { AppointmentServiceValueSection } from './AppointmentServiceValueSection'
import { PatientPicker } from './PatientPicker'
import { SlotPicker } from './SlotPicker'

type CreateAppointmentModalProps = {
  open: boolean
  onClose: () => void
  onCreated: (appointment: Appointment) => void
  fixedProfile?: ProfileListItem | null
}

type PatientMode = 'existing' | 'new'

type FieldErrors = Partial<
  Record<
    | 'profileId'
    | 'appointmentDate'
    | 'startTime'
    | 'patient'
    | 'patientName'
    | 'patientEmail'
    | 'patientPhone',
    string
  >
>

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
  // Starts on "existing" so a returning patient is looked up before a new
  // Patient record is created for them.
  const [patientMode, setPatientMode] = useState<PatientMode>('existing')
  // The explicitly chosen Patient. Its patientId is the appointment's
  // identity; the contact fields below are only this booking's snapshot.
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
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
  const todayInputValue = brazilTodayIso()
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
    set('estimatedAmount', servicePriceToMoneyInput(service?.priceFrom))
  }, [form.serviceId, services, estimateManuallyEdited])

  useEffect(() => {
    set('startTime', '')
    if (!form.profileId || !form.appointmentDate) {
      setSlots([])
      setIsLoadingSlots(false)
      return
    }
    let isCurrent = true
    setIsLoadingSlots(true)
    getAvailableSlots({
      profileId: form.profileId,
      date: form.appointmentDate,
      serviceId: form.serviceId || undefined,
    })
      .then((nextSlots) => {
        if (isCurrent) setSlots(nextSlots)
      })
      .catch(() => {
        if (isCurrent) setSlots([])
      })
      .finally(() => {
        if (isCurrent) setIsLoadingSlots(false)
      })
    return () => {
      isCurrent = false
    }
  }, [form.profileId, form.appointmentDate, form.serviceId])

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetPatient() {
    setPatientMode('existing')
    setSelectedPatient(null)
    setFieldErrors({})
  }

  function handlePatientModeChange(mode: PatientMode) {
    setPatientMode(mode)
    setSelectedPatient(null)
    setFieldErrors({})
    setForm((prev) => ({ ...prev, patientName: '', patientEmail: '', patientPhone: '' }))
  }

  function handlePatientSelect(patient: PatientSummary) {
    setSelectedPatient(patient)
    setFieldErrors((prev) => ({ ...prev, patient: undefined }))
    setForm((prev) => ({
      ...prev,
      patientName: patient.patientName,
      patientEmail: patient.patientEmail ?? '',
      patientPhone: patient.patientPhone ? formatPhoneBR(patient.patientPhone) : '',
    }))
  }

  function handlePatientClear() {
    setSelectedPatient(null)
    setForm((prev) => ({ ...prev, patientName: '', patientEmail: '', patientPhone: '' }))
  }

  function handleClose() {
    // A pending request must finish first: closing would reset the form while
    // the appointment may still be created.
    if (isSubmitting) return
    resetAndClose()
  }

  function resetAndClose() {
    setForm(EMPTY_FORM)
    resetPatient()
    setServices([])
    setProfileAvailability([])
    setProfileExceptions([])
    setSlots([])
    setEstimateManuallyEdited(false)
    setPendingAvatarBase64(null)
    onClose()
  }

  // The form is noValidate: every rule is checked here and shown on its field.
  function validateAppointmentForm(): FieldErrors {
    const errors: FieldErrors = {}
    const date = formatDateInputValue(form.appointmentDate)
    if (!form.profileId) errors.profileId = APPOINTMENT_FIELD_MESSAGES.profileRequired
    if (!date) errors.appointmentDate = APPOINTMENT_FIELD_MESSAGES.dateRequired
    else if (date < todayInputValue) errors.appointmentDate = APPOINTMENT_FIELD_MESSAGES.datePast
    if (!form.startTime) errors.startTime = APPOINTMENT_FIELD_MESSAGES.timeRequired
    else if (date === todayInputValue && form.startTime < nowTimeInputValue) {
      errors.startTime = APPOINTMENT_FIELD_MESSAGES.timePast
    }
    if (patientMode === 'existing' && !selectedPatient?.patientId) {
      errors.patient = APPOINTMENT_FIELD_MESSAGES.patientRequired
      return errors
    }
    if (!form.patientName.trim())
      errors.patientName = APPOINTMENT_FIELD_MESSAGES.patientNameRequired
    if (form.patientEmail.trim() && !isValidEmail(form.patientEmail)) {
      errors.patientEmail = INVALID_EMAIL_MESSAGE
    }
    if (!isValidWhatsappPhoneBR(form.patientPhone)) {
      errors.patientPhone = WHATSAPP_PHONE_REQUIRED_MESSAGE
    }
    return errors
  }

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSubmitting) return
    const nextErrors = validateAppointmentForm()
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setIsSubmitting(true)
    try {
      const dto: CreateAppointmentDto = {
        patientId:
          patientMode === 'existing' ? (selectedPatient?.patientId ?? undefined) : undefined,
        profileId: form.profileId,
        serviceId: form.serviceId || undefined,
        patientName: form.patientName.trim(),
        patientEmail: form.patientEmail.trim() || undefined,
        // Stored as digits; formatting is presentation only.
        patientPhone: normalizePhoneBR(form.patientPhone),
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
        notes: form.notes.trim() || undefined,
        estimatedAmountCents: moneyInputToOptionalCents(form.estimatedAmount) ?? undefined,
      }
      const appointment = await createAppointment(dto)

      // Capture avatar before form is cleared by handleClose.
      // The upload is non-blocking — a failure shows a warning but never
      // undoes the appointment that was already persisted.
      const avatarToUpload = pendingAvatarBase64
      const avatarIdentifier = dto.patientEmail ?? dto.patientName

      showAlert({ title: 'Agendamento criado', tone: 'success' })
      onCreated(appointment)
      resetAndClose()

      if (avatarToUpload) {
        upsertPatientAvatar(avatarIdentifier, avatarToUpload, appointment.patientId).catch(() => {
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
          onEscapeKeyDown={(event) => {
            if (isSubmitting) event.preventDefault()
          }}
          onInteractOutside={(event) => {
            if (isSubmitting) event.preventDefault()
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <Dialog.Title id="create-modal-title" className="text-lg font-semibold text-foreground">
              Novo agendamento
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Preencha os dados para criar um novo agendamento de consulta.
            </Dialog.Description>
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
            noValidate
            onSubmit={handleSubmit}
            className="app-scrollbar flex-1 overflow-y-auto px-6 py-6 space-y-5"
          >
            {/* Dentist */}
            <FormField label="Profissional" htmlFor="profileId" error={fieldErrors.profileId}>
              <Select
                required
                disabled={Boolean(fixedProfile) || isLoadingProfiles || isSubmitting}
                value={form.profileId}
                onValueChange={(value) => {
                  clearFieldError('profileId')
                  set('profileId', value)
                  set('serviceId', '')
                  set('appointmentDate', '')
                  set('estimatedAmount', '')
                  setEstimateManuallyEdited(false)
                }}
              >
                <SelectTrigger
                  id="profileId"
                  aria-invalid={fieldErrors.profileId ? true : undefined}
                  aria-describedby={fieldErrors.profileId ? 'profileId-error' : undefined}
                >
                  <SelectValue
                    placeholder={isLoadingProfiles ? 'Carregando...' : 'Selecione um profissional'}
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

            {/* Service + estimated amount */}
            <AppointmentServiceValueSection
              services={services}
              serviceId={form.serviceId}
              isSelectDisabled={!form.profileId || services.length === 0 || isSubmitting}
              isSubmitting={isSubmitting}
              noProfessionalHint={!form.profileId}
              estimatedAmount={form.estimatedAmount}
              estimateManuallyEdited={estimateManuallyEdited}
              onServiceChange={(id) => set('serviceId', id)}
              onAmountChange={(v) => set('estimatedAmount', v)}
              onAmountManuallyEdited={() => setEstimateManuallyEdited(true)}
              onAmountRestored={() => setEstimateManuallyEdited(false)}
            />

            {/* Date */}
            <FormField label="Data" htmlFor="appointmentDate" error={fieldErrors.appointmentDate}>
              <DatePickerInput
                id="appointmentDate"
                required
                invalid={Boolean(fieldErrors.appointmentDate)}
                disabled={!form.profileId || isSubmitting}
                value={form.appointmentDate}
                minValue={todayInputValue}
                disabledDate={
                  form.profileId
                    ? (dv) => !isDateAvailable(dv, profileAvailability, profileExceptions)
                    : undefined
                }
                onValueChange={(value) => {
                  clearFieldError('appointmentDate')
                  set('appointmentDate', formatDateInputValue(value))
                }}
              />
            </FormField>

            {/* Time slots */}
            <FormField label="Horário" error={fieldErrors.startTime}>
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
                  onChange={(time) => {
                    clearFieldError('startTime')
                    set('startTime', time)
                  }}
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

            {/* Patient identity: explicit choice between an existing Patient and a new one */}
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-foreground">Paciente</legend>
              <div
                role="radiogroup"
                aria-label="Tipo de paciente"
                className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1"
              >
                {(
                  [
                    ['existing', 'Paciente existente'],
                    ['new', 'Novo paciente'],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={patientMode === mode}
                    disabled={isSubmitting}
                    onClick={() => handlePatientModeChange(mode)}
                    className={
                      patientMode === mode
                        ? 'rounded-md bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-sm'
                        : 'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground'
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              {patientMode === 'existing' && (
                <PatientPicker
                  selected={selectedPatient}
                  disabled={isSubmitting}
                  error={fieldErrors.patient}
                  onSelect={handlePatientSelect}
                  onClear={handlePatientClear}
                />
              )}
            </fieldset>

            {(patientMode === 'new' || selectedPatient) && (
              <>
                {selectedPatient && (
                  <p className="text-xs text-muted-foreground">
                    Os dados de contato abaixo ficam registrados neste agendamento. Ajustá-los não
                    troca o paciente selecionado.
                  </p>
                )}
                <FormField
                  label="Nome do paciente"
                  htmlFor="patientName"
                  error={fieldErrors.patientName}
                >
                  <TextInput
                    id="patientName"
                    required
                    aria-invalid={fieldErrors.patientName ? true : undefined}
                    aria-describedby={fieldErrors.patientName ? 'patientName-error' : undefined}
                    autoComplete="off"
                    maxLength={PATIENT_NAME_MAX_LENGTH}
                    disabled={isSubmitting}
                    placeholder="Nome completo"
                    value={form.patientName}
                    onChange={(e) => {
                      clearFieldError('patientName')
                      set('patientName', e.target.value)
                    }}
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="E-mail"
                    htmlFor="patientEmail"
                    optional
                    error={fieldErrors.patientEmail}
                  >
                    <TextInput
                      id="patientEmail"
                      type="email"
                      inputMode="email"
                      autoComplete="off"
                      maxLength={EMAIL_MAX_LENGTH}
                      disabled={isSubmitting}
                      placeholder="nome@exemplo.com"
                      value={form.patientEmail}
                      aria-invalid={fieldErrors.patientEmail ? true : undefined}
                      aria-describedby={fieldErrors.patientEmail ? 'patientEmail-error' : undefined}
                      onChange={(e) => {
                        set('patientEmail', e.target.value)
                        clearFieldError('patientEmail')
                      }}
                    />
                  </FormField>
                  <FormField
                    label="Telefone com WhatsApp"
                    htmlFor="patientPhone"
                    error={fieldErrors.patientPhone}
                  >
                    <TextInput
                      id="patientPhone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="off"
                      maxLength={PATIENT_PHONE_MAX_LENGTH}
                      required
                      disabled={isSubmitting}
                      placeholder="(11) 99999-9999"
                      value={form.patientPhone}
                      aria-invalid={fieldErrors.patientPhone ? true : undefined}
                      aria-describedby={fieldErrors.patientPhone ? 'patientPhone-error' : undefined}
                      onChange={(e) => {
                        clearFieldError('patientPhone')
                        set('patientPhone', formatPhoneBR(e.target.value))
                      }}
                    />
                  </FormField>
                </div>
              </>
            )}

            <FormField label="Observações" htmlFor="notes" optional>
              <TextArea
                id="notes"
                maxLength={APPOINTMENT_NOTES_MAX_LENGTH}
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
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
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
