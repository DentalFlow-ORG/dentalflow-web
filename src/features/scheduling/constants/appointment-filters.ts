import type { Appointment } from '../types/scheduling.types'

export const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELED', label: 'Cancelado' },
  { value: 'NO_SHOW', label: 'Não compareceu' },
]

export const SEARCH_FN = (appointment: Appointment, query: string) =>
  `${appointment.patientName} ${appointment.patientEmail ?? ''} ${
    appointment.patientPhone ?? ''
  }`
    .toLowerCase()
    .includes(query)

export const FILTER_FNS = {
  status: (appointment: Appointment, value: string) => appointment.status === value,
  profileId: (appointment: Appointment, value: string) =>
    appointment.profileId === value,
}
