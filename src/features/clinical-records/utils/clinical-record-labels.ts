import type { ClinicalRecordStatus, ClinicalTemplateCategory } from '../types/clinical-record.types'

export const CLINICAL_RECORD_STATUS_LABEL: Record<ClinicalRecordStatus, string> = {
  DRAFT: 'Rascunho',
  COMPLETED: 'Concluído',
  LOCKED: 'Bloqueado',
  CANCELED: 'Cancelado',
}

export const CLINICAL_RECORD_STATUS_COLOR: Record<ClinicalRecordStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  LOCKED: 'bg-slate-100 text-slate-700',
  CANCELED: 'bg-red-100 text-red-700',
}

export const CLINICAL_TEMPLATE_CATEGORY_LABEL: Record<ClinicalTemplateCategory, string> = {
  ANAMNESIS: 'Anamnese',
  EVOLUTION: 'Evolução clínica',
  PRESCRIPTION: 'Prescrição',
  RECOMMENDATION: 'Recomendações',
  PROCEDURE: 'Procedimento',
  OTHER: 'Outros',
}
