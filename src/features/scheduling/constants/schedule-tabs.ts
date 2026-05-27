import type { ScheduleTab } from '../hooks/useSchedulePage'

export const TABS: Array<{ id: ScheduleTab; label: string }> = [
  { id: 'agenda', label: 'Agenda' },
  { id: 'disponibilidade', label: 'Disponibilidade' },
  { id: 'excecoes', label: 'Exceções' },
]
