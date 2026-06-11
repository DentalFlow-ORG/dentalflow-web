import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { formatDateInputValue, formatTimeInputValue } from '@/lib/date-time-formatters'
import {
  WHATSAPP_PHONE_REQUIRED_MESSAGE,
  formatPhoneBR,
  isValidWhatsappPhoneBR,
} from '@/lib/field-formatters'
import { getProfile } from '../../services/profiles.service'
import type { ProfileService } from '../../types/profile.types'
import {
  getCurrentTimeInputValue,
  hasAppointmentTimePassed,
  isDateAvailable,
  reaisToCents,
} from '../../utils/appointment-form-utils'

import {
  getAvailableSlots,
  listAvailability,
  listAvailabilityExceptions,
  updateAppointment,
} from '../../services/scheduling.service'
import type {
  Appointment,
  Availability,
  AvailabilityException,
  AvailabilitySlot,
  UpdateAppointmentDto,
} from '../../types/scheduling.types'
import { AppointmentServiceValueSection } from './AppointmentServiceValueSection'
import { SlotPicker } from './SlotPicker'

type EditAppointmentModalProps = {
  appointment: Appointment | null
  onClose: () => void
  onUpdated: (appointment: Appointment) => void
}

type FormState = {
  serviceId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  appointmentDate: string
  startTime: string
  notes: string
  estimatedAmount: string
}

export function EditAppointmentModal({
  appointment,
  onClose,
  onUpdated,
}: EditAppointmentModalProps) {
  const { showAlert } = useGlobalAlerts()
  const [form, setForm] = useState<FormState>(() => buildFormState(appointment))
  const [services, setServices] = useState<ProfileService[]>([])
  const [profileAvailability, setProfileAvailability] = useState<Availability[]>([])
  const [profileExceptions, setProfileExceptions] = useState<AvailabilityException[]>([])
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [estimateManuallyEdited, setEstimateManuallyEdited] = useState(
    () => appointment?.estimatedAmountCents != null,
  )
  const todayInputValue = brazilTodayIso()
  const nowTimeInputValue = getCurrentTimeInputValue()

  useEffect(() => {
    setForm(buildFormState(appointment))
    setEstimateManuallyEdited(appointment?.estimatedAmountCents != null)
  }, [appointment])

  useEffect(() => {
    if (!appointment) {
      setServices([])
      setProfileAvailability([])
      setProfileExceptions([])
      return
    }

    setIsLoadingServices(true)
    Promise.all([
      getProfile(appointment.profileId).then((p) => p.services.filter((s) => s.isActive)),
      listAvailability(appointment.profileId),
      listAvailabilityExceptions(appointment.profileId),
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
      .finally(() => setIsLoadingServices(false))
  }, [appointment])

  useEffect(() => {
    if (estimateManuallyEdited) return
    if (!form.serviceId) {
      setForm((prev) => ({ ...prev, estimatedAmount: '' }))
      return
    }
    const service = services.find((s) => s.id === form.serviceId)
    if (service?.priceFrom != null) {
      const cents = Math.round(service.priceFrom * 100)
      setForm((prev) => ({ ...prev, estimatedAmount: (cents / 100).toFixed(2).replace('.', ',') }))
    } else {
      setForm((prev) => ({ ...prev, estimatedAmount: '' }))
    }
  }, [form.serviceId, services, estimateManuallyEdited])

  useEffect(() => {
    if (!appointment || !form.appointmentDate) {
      setSlots([])
      setIsLoadingSlots(false)
      return
    }
    setIsLoadingSlots(true)
    getAvailableSlots({
      profileId: appointment.profileId,
      date: form.appointmentDate,
      serviceId: form.serviceId || undefined,
    })
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setIsLoadingSlots(false))
  }, [appointment, form.appointmentDate, form.serviceId])

  if (!appointment) return null

  const currentAppointment = appointment
  const isPastAppointment = hasAppointmentTimePassed(currentAppointment)
  const modalTitle = isPastAppointment ? 'Reagendar consulta' : 'Editar agendamento'
  const submitLabel = isPastAppointment ? 'Reagendar consulta' : 'Salvar alterações'
  const submittingLabel = isPastAppointment ? 'Reagendando...' : 'Salvando...'

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleClose() {
    onClose()
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!form.patientName.trim() || !form.appointmentDate || !form.startTime) {
      return
    }
    if (!isPastAppointment && !isValidWhatsappPhoneBR(form.patientPhone)) {
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
        description: 'Escolha uma data a partir de hoje.',
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
        description: 'Escolha um horário que ainda não passou.',
        tone: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const scheduleDto: UpdateAppointmentDto = {
        appointmentDate: form.appointmentDate,
        startTime: form.startTime,
      }
      const dto: UpdateAppointmentDto = isPastAppointment
        ? scheduleDto
        : {
            ...scheduleDto,
            serviceId: form.serviceId || undefined,
            patientName: form.patientName.trim(),
            patientEmail: form.patientEmail.trim() || undefined,
            patientPhone: form.patientPhone.trim(),
            notes: form.notes.trim() || undefined,
            estimatedAmountCents: reaisToCents(form.estimatedAmount),
          }
      const updated = await updateAppointment(currentAppointment.id, dto)

      showAlert({
        title: isPastAppointment ? 'Consulta reagendada' : 'Agendamento atualizado',
        tone: 'success',
      })
      onUpdated(updated)
      handleClose()
    } catch (err) {
      showAlert({
        title: 'Erro ao atualizar agendamento',
        description: err instanceof Error ? err.message : undefined,
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={!!appointment} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="edit-appointment-title"
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={handleClose}
          onInteractOutside={handleClose}
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <Dialog.Title
                id="edit-appointment-title"
                className="text-lg font-semibold text-foreground"
              >
                {modalTitle}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {isPastAppointment
                  ? 'Esta consulta já passou. Ajuste a data e o horário para remarcar.'
                  : (currentAppointment.profile?.displayName ?? 'Profissional não informado')}
              </Dialog.Description>
            </div>
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

          <form
            id="edit-appointment-form"
            onSubmit={handleSubmit}
            className="app-scrollbar flex-1 space-y-5 overflow-y-auto px-6 py-6"
          >
            <FormField label="Paciente" htmlFor="editPatientName">
              <TextInput
                id="editPatientName"
                required
                maxLength={100}
                disabled={isSubmitting || isPastAppointment}
                value={form.patientName}
                onChange={(event) => set('patientName', event.target.value)}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="E-mail" htmlFor="editPatientEmail" optional>
                <TextInput
                  id="editPatientEmail"
                  type="email"
                  disabled={isSubmitting || isPastAppointment}
                  value={form.patientEmail}
                  onChange={(event) => set('patientEmail', event.target.value)}
                />
              </FormField>
              <FormField label="Telefone com WhatsApp" htmlFor="editPatientPhone">
                <TextInput
                  id="editPatientPhone"
                  type="tel"
                  maxLength={20}
                  required={!isPastAppointment}
                  disabled={isSubmitting || isPastAppointment}
                  value={form.patientPhone}
                  onChange={(event) => set('patientPhone', formatPhoneBR(event.target.value))}
                />
              </FormField>
            </div>

            {/* Service + estimated amount */}
            <AppointmentServiceValueSection
              services={services}
              serviceId={form.serviceId}
              isSelectDisabled={
                isLoadingServices || services.length === 0 || isSubmitting || isPastAppointment
              }
              isSubmitting={isSubmitting}
              isLoading={isLoadingServices}
              showNoServiceOption
              showEstimatedAmount={!isPastAppointment}
              estimatedAmount={form.estimatedAmount}
              estimateManuallyEdited={estimateManuallyEdited}
              onServiceChange={(id) => {
                set('serviceId', id)
                set('startTime', '')
                setEstimateManuallyEdited(false)
              }}
              onAmountChange={(v) => set('estimatedAmount', v)}
              onAmountManuallyEdited={() => setEstimateManuallyEdited(true)}
              onAmountRestored={() => setEstimateManuallyEdited(false)}
            />

            {/* Date */}
            <FormField label="Data" htmlFor="editAppointmentDate">
              <DatePickerInput
                id="editAppointmentDate"
                required
                disabled={isSubmitting}
                minValue={todayInputValue}
                value={form.appointmentDate}
                disabledDate={(dv) => !isDateAvailable(dv, profileAvailability, profileExceptions)}
                onValueChange={(value) => {
                  set('appointmentDate', formatDateInputValue(value))
                  set('startTime', '')
                }}
              />
            </FormField>

            {/* Time slots */}
            <FormField label="Horário">
              {!form.appointmentDate ? (
                <p className="py-2 text-sm text-muted-foreground">
                  Selecione uma data para ver os horários disponíveis
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

            <FormField label="Observações" htmlFor="editNotes" optional>
              <TextArea
                id="editNotes"
                maxLength={2000}
                disabled={isSubmitting || isPastAppointment}
                value={form.notes}
                onChange={(event) => set('notes', event.target.value)}
                rows={3}
                className="min-h-0"
              />
            </FormField>
          </form>

          <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="edit-appointment-form"
              disabled={isSubmitting || !form.startTime}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function buildFormState(appointment: Appointment | null): FormState {
  return {
    serviceId: appointment?.serviceId ?? '',
    patientName: appointment?.patientName ?? '',
    patientEmail: appointment?.patientEmail ?? '',
    patientPhone: appointment?.patientPhone ?? '',
    appointmentDate: appointment ? formatDateInputValue(appointment.appointmentDate) : '',
    startTime: appointment ? formatTimeInputValue(appointment.startTime) : '',
    notes: appointment?.notes ?? '',
    estimatedAmount:
      appointment?.estimatedAmountCents != null
        ? (appointment.estimatedAmountCents / 100).toFixed(2).replace('.', ',')
        : '',
  }
}
