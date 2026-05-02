import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { TimePickerInput } from '@/components/common/TimePickerInput'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProfile, listProfiles } from '@/features/profiles/services/profiles.service'
import type { ProfileListItem, ProfileService } from '@/features/profiles/types'
import {
  formatDateInputValue,
  formatTimeInputValue,
} from '@/lib/date-time-formatters'
import { formatPhoneBR } from '@/lib/field-formatters'

import {
  createAppointment,
  listAvailability,
  listAvailabilityExceptions,
} from '../../services/scheduling.service'
import type {
  Appointment,
  Availability,
  AvailabilityException,
  CreateAppointmentDto,
} from '../../types/scheduling.types'
import { BUSINESS_END_TIME, BUSINESS_START_TIME } from '../../utils/time'

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
}

export function CreateAppointmentModal({
  open,
  onClose,
  onCreated,
  fixedProfile,
}: CreateAppointmentModalProps) {
  const { showAlert } = useGlobalAlerts()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [services, setServices] = useState<ProfileService[]>([])
  const [profileAvailability, setProfileAvailability] = useState<Availability[]>([])
  const [profileExceptions, setProfileExceptions] = useState<AvailabilityException[]>([])
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const todayInputValue = formatDateInputValue(new Date())
  const nowTimeInputValue = getCurrentTimeInputValue()

  const timeWindow = getTimeWindowForDate(form.appointmentDate, profileAvailability, profileExceptions)
  const effectiveMinTime = getMinStartTime(form.appointmentDate, todayInputValue, nowTimeInputValue, timeWindow.min)
  const selectedService = services.find((s) => s.id === form.serviceId)
  const effectiveMaxTime = subtractMinutes(timeWindow.max, selectedService?.durationMinutes ?? 0)

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
    if (
      form.appointmentDate === todayInputValue &&
      form.startTime &&
      formatTimeInputValue(form.startTime) <
        getMinStartTime(form.appointmentDate, todayInputValue, nowTimeInputValue)
    ) {
      set('startTime', '')
    }
  }, [form.appointmentDate, form.startTime, nowTimeInputValue, todayInputValue])

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleClose() {
    setForm(EMPTY_FORM)
    setServices([])
    setProfileAvailability([])
    setProfileExceptions([])
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.profileId || !form.patientName || !form.appointmentDate || !form.startTime) {
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
      formatTimeInputValue(form.startTime) < nowTimeInputValue
    ) {
      showAlert({
        title: 'Horário inválido',
        description: 'Para hoje, escolha um horário igual ou posterior ao horário atual.',
        tone: 'error',
      })
      return
    }
    if (form.startTime < timeWindow.min || form.startTime > effectiveMaxTime) {
      showAlert({
        title: 'Horário fora da disponibilidade',
        description: `Escolha um horário entre ${timeWindow.min} e ${effectiveMaxTime}.`,
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
        patientPhone: form.patientPhone.trim() || undefined,
        appointmentDate: formatDateInputValue(form.appointmentDate),
        startTime: formatTimeInputValue(form.startTime),
        notes: form.notes.trim() || undefined,
      }
      const appointment = await createAppointment(dto)
      showAlert({ title: 'Agendamento criado', tone: 'success' })
      onCreated(appointment)
      handleClose()
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
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 flex flex-col"
          onEscapeKeyDown={handleClose}
          onInteractOutside={handleClose}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <Dialog.Title
              id="create-modal-title"
              className="text-lg font-semibold text-slate-950"
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
                onValueChange={(value) => {
                  set('serviceId', value)
                  if (form.startTime) {
                    const svc = services.find((s) => s.id === value)
                    const newMax = subtractMinutes(timeWindow.max, svc?.durationMinutes ?? 0)
                    if (form.startTime > newMax) set('startTime', '')
                  }
                }}
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
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {/* Date and time */}
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Data" htmlFor="appointmentDate">
                <DatePickerInput
                  id="appointmentDate"
                  required
                  disabled={isSubmitting}
                  value={form.appointmentDate}
                  minValue={todayInputValue}
                  disabledDate={
                    form.profileId
                      ? (dv) => !isDateAvailable(dv, profileAvailability, profileExceptions)
                      : undefined
                  }
                  onValueChange={(value) => {
                    const nextDate = formatDateInputValue(value)
                    set('appointmentDate', nextDate)
                    if (form.startTime) {
                      const nextWindow = getTimeWindowForDate(nextDate, profileAvailability, profileExceptions)
                      const nextMin = getMinStartTime(nextDate, todayInputValue, nowTimeInputValue, nextWindow.min)
                      if (form.startTime < nextMin || form.startTime >= nextWindow.max) {
                        set('startTime', '')
                      }
                    }
                  }}
                />
              </FormField>
              <FormField label="Horário" htmlFor="startTime">
                <TimePickerInput
                  id="startTime"
                  name="startTime"
                  required
                  disabled={isSubmitting}
                  value={form.startTime}
                  minValue={effectiveMinTime}
                  maxValue={timeWindow.max}
                  selectableMax={effectiveMaxTime}
                  onValueChange={(value) => set('startTime', formatTimeInputValue(value))}
                />
              </FormField>
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

            <div className="grid grid-cols-2 gap-4">
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
              <FormField label="Telefone" htmlFor="patientPhone" optional>
                <TextInput
                  id="patientPhone"
                  type="tel"
                  maxLength={20}
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
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end">
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
              disabled={isSubmitting}
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

function subtractMinutes(time: string, minutes: number): string {
  if (!minutes || !time) return time
  const [h, m] = time.split(':').map(Number)
  const total = Math.max(0, h * 60 + m - minutes)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function getMinStartTime(
  appointmentDate: string,
  todayInputValue: string,
  nowTimeInputValue: string,
  availabilityStart: string = BUSINESS_START_TIME,
) {
  if (appointmentDate !== todayInputValue) return availabilityStart
  return nowTimeInputValue > availabilityStart ? nowTimeInputValue : availabilityStart
}

function getCurrentTimeInputValue() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function isDateAvailable(
  dateValue: string,
  availability: Availability[],
  exceptions: AvailabilityException[],
): boolean {
  if (!dateValue) return true
  const exception = exceptions.find((e) => formatDateInputValue(e.exceptionDate) === dateValue)
  if (exception?.isDayOff) return false
  if (exception) return true // exceção com horário especial, mas disponível
  const dow = new Date(`${dateValue}T00:00:00Z`).getUTCDay()
  if (availability.length === 0) return dow >= 1 && dow <= 5 // padrão: Seg-Sex
  return availability.some((a) => a.dayOfWeek === dow && a.isActive)
}

function getTimeWindowForDate(
  dateValue: string,
  availability: Availability[],
  exceptions: AvailabilityException[],
): { min: string; max: string } {
  if (!dateValue) return { min: BUSINESS_START_TIME, max: BUSINESS_END_TIME }
  const exception = exceptions.find((e) => formatDateInputValue(e.exceptionDate) === dateValue)
  if (exception && !exception.isDayOff && exception.startTime && exception.endTime) {
    return {
      min: formatTimeInputValue(exception.startTime),
      max: formatTimeInputValue(exception.endTime),
    }
  }
  const dow = new Date(`${dateValue}T00:00:00Z`).getUTCDay()
  if (availability.length === 0) return { min: BUSINESS_START_TIME, max: BUSINESS_END_TIME }
  const daySlots = availability.filter((a) => a.dayOfWeek === dow && a.isActive)
  if (daySlots.length === 0) return { min: BUSINESS_START_TIME, max: BUSINESS_END_TIME }
  const min = daySlots
    .map((s) => formatTimeInputValue(s.startTime))
    .reduce((a, b) => (a < b ? a : b))
  const max = daySlots
    .map((s) => formatTimeInputValue(s.endTime))
    .reduce((a, b) => (a > b ? a : b))
  return { min, max }
}
