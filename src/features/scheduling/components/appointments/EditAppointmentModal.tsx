import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { TimePickerInput } from '@/components/common/TimePickerInput'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProfile } from '@/features/profiles/services/profiles.service'
import type { ProfileService } from '@/features/profiles/types'
import {
  formatDateInputValue,
  formatTimeInputValue,
} from '@/lib/date-time-formatters'
import { formatPhoneBR } from '@/lib/field-formatters'

import { updateAppointment } from '../../services/scheduling.service'
import type { Appointment, UpdateAppointmentDto } from '../../types/scheduling.types'
import {
  BUSINESS_END_TIME,
  BUSINESS_START_TIME,
  isBusinessTime,
} from '../../utils/time'

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
  const [isLoadingServices, setIsLoadingServices] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const todayInputValue = formatDateInputValue(new Date())
  const nowTimeInputValue = getCurrentTimeInputValue()

  useEffect(() => {
    setForm(buildFormState(appointment))
  }, [appointment])

  useEffect(() => {
    if (!appointment) {
      setServices([])
      return
    }

    setIsLoadingServices(true)
    getProfile(appointment.profileId)
      .then((profile) => setServices(profile.services.filter((service) => service.isActive)))
      .catch(() => setServices([]))
      .finally(() => setIsLoadingServices(false))
  }, [appointment])

  if (!appointment) return null

  const currentAppointment = appointment
  const isPastAppointment = hasAppointmentTimePassed(currentAppointment)
  const timeMinValue = getMinStartTime(
    form.appointmentDate,
    todayInputValue,
    nowTimeInputValue,
  )
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
    if (!isBusinessTime(form.startTime)) {
      showAlert({
        title: 'Horario fora do expediente',
        description: `Escolha um horario entre ${BUSINESS_START_TIME} e ${BUSINESS_END_TIME}.`,
        tone: 'error',
      })
      return
    }
    if (formatDateInputValue(form.appointmentDate) < todayInputValue) {
      showAlert({
        title: 'Data invalida',
        description: 'Escolha uma data a partir de hoje.',
        tone: 'error',
      })
      return
    }
    if (
      formatDateInputValue(form.appointmentDate) === todayInputValue &&
      formatTimeInputValue(form.startTime) < nowTimeInputValue
    ) {
      showAlert({
        title: 'Horario invalido',
        description: 'Escolha um horario que ainda nao passou.',
        tone: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const scheduleDto: UpdateAppointmentDto = {
        appointmentDate: formatDateInputValue(form.appointmentDate),
        startTime: formatTimeInputValue(form.startTime),
      }
      const dto: UpdateAppointmentDto = isPastAppointment
        ? scheduleDto
        : {
            ...scheduleDto,
            serviceId: form.serviceId || undefined,
            patientName: form.patientName.trim(),
            patientEmail: form.patientEmail.trim() || undefined,
            patientPhone: form.patientPhone.trim() || undefined,
            notes: form.notes.trim() || undefined,
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
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={handleClose}
          onInteractOutside={handleClose}
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <Dialog.Title
                id="edit-appointment-title"
                className="text-lg font-semibold text-slate-950"
              >
                {modalTitle}
              </Dialog.Title>
              <p className="mt-1 text-sm text-slate-500">
                {isPastAppointment
                  ? 'Esta consulta ja passou. Ajuste data e horario para remarcar.'
                  : currentAppointment.profile.displayName}
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
              <FormField label="Telefone" htmlFor="editPatientPhone" optional>
                <TextInput
                  id="editPatientPhone"
                  type="tel"
                  maxLength={20}
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
                onValueChange={(value) =>
                  set('serviceId', value === NO_SERVICE_SENTINEL ? '' : value)
                }
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
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Data" htmlFor="editAppointmentDate">
                <DatePickerInput
                  id="editAppointmentDate"
                  required
                  disabled={isSubmitting}
                  minValue={todayInputValue}
                  value={form.appointmentDate}
                  onValueChange={(value) => {
                    const nextDate = formatDateInputValue(value)
                    set('appointmentDate', nextDate)
                    if (
                      nextDate === todayInputValue &&
                      form.startTime &&
                      formatTimeInputValue(form.startTime) < nowTimeInputValue
                    ) {
                      set('startTime', '')
                    }
                  }}
                />
              </FormField>
              <FormField label="Horário" htmlFor="editStartTime">
                <TimePickerInput
                  id="editStartTime"
                  name="editStartTime"
                  required
                  disabled={isSubmitting}
                  value={form.startTime}
                  minValue={timeMinValue}
                  maxValue={BUSINESS_END_TIME}
                  onValueChange={(value) => set('startTime', formatTimeInputValue(value))}
                />
              </FormField>
            </div>

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

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" form="edit-appointment-form" disabled={isSubmitting}>
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
  }
}

function hasAppointmentTimePassed(appointment: Appointment) {
  const appointmentDate = formatDateInputValue(appointment.appointmentDate)
  const today = formatDateInputValue(new Date())

  if (appointmentDate < today) return true
  if (appointmentDate > today) return false

  return formatTimeInputValue(appointment.startTime) < getCurrentTimeInputValue()
}

function getCurrentTimeInputValue() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return `${hours}:${minutes}`
}

function getMinStartTime(
  appointmentDate: string,
  todayInputValue: string,
  nowTimeInputValue: string,
) {
  if (formatDateInputValue(appointmentDate) !== todayInputValue) {
    return BUSINESS_START_TIME
  }

  return nowTimeInputValue > BUSINESS_START_TIME ? nowTimeInputValue : BUSINESS_START_TIME
}
