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
import { getProfile } from '../../services/profiles.service'
import type { ProfileService } from '../../types/profile.types'
import {
  formatDateInputValue,
  formatTimeInputValue,
} from '@/lib/date-time-formatters'
import {
  getCurrentTimeInputValue,
  hasAppointmentTimePassed,
  isDateAvailable,
  reaisToCents,
} from '../../utils/appointment-form-utils'
import {
  WHATSAPP_PHONE_REQUIRED_MESSAGE,
  formatPhoneBR,
  isValidWhatsappPhoneBR,
} from '@/lib/field-formatters'

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

const NO_SERVICE_SENTINEL = '__NO_SERVICE__'

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
  const todayInputValue = formatDateInputValue(new Date())
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const submitLabel = isPastAppointment ? 'Reagendar consulta' : 'Salvar alteracoes'
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
              <p className="mt-1 text-sm text-muted-foreground">
                {isPastAppointment
                  ? 'Esta consulta ja passou. Ajuste data e horario para remarcar.'
                  : currentAppointment.profile?.displayName ?? 'Profissional não informado'}
              </p>
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
            className="flex-1 space-y-5 overflow-y-auto px-6 py-6"
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

            <FormField label="Serviço" htmlFor="editServiceId" optional>
              <Select
                disabled={
                  isLoadingServices ||
                  services.length === 0 ||
                  isSubmitting ||
                  isPastAppointment
                }
                value={form.serviceId || NO_SERVICE_SENTINEL}
                onValueChange={(value) => {
                  set('serviceId', value === NO_SERVICE_SENTINEL ? '' : value)
                  set('startTime', '')
                  setEstimateManuallyEdited(false)
                }}
              >
                <SelectTrigger id="editServiceId">
                  <SelectValue
                    placeholder={
                      isLoadingServices
                        ? 'Carregando...'
                        : services.length === 0
                          ? 'Nenhum servico cadastrado'
                          : 'Selecione um servico'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SERVICE_SENTINEL}>Sem serviço</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                      {service.durationMinutes ? ` (${service.durationMinutes} min)` : ''}
                      {service.priceFrom != null
                        ? ` — R$ ${service.priceFrom.toFixed(2).replace('.', ',')}`
                        : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Estimated amount */}
            {!isPastAppointment && (
              <FormField
                label="Valor previsto (R$)"
                htmlFor="editEstimatedAmount"
                optional
                hint="Preenchido pelo serviço selecionado. Ajuste para desconto ou negociação."
              >
                <TextInput
                  id="editEstimatedAmount"
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
            )}

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

