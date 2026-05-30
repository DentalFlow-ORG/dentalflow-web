import type { ClinicalRecordStatus } from '../types/clinical-record.types'

export type StatusFilter = ClinicalRecordStatus | 'TODOS'

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunhos' },
  { value: 'COMPLETED', label: 'Concluídos' },
  { value: 'LOCKED', label: 'Bloqueados' },
  { value: 'CANCELED', label: 'Cancelados' },
]
