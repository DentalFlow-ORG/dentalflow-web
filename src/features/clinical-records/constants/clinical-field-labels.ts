import type { ClinicalDictationFieldKey } from '../types/clinical-dictation.types'

export const CLINICAL_FIELD_LABELS: Record<ClinicalDictationFieldKey, string> = {
  chiefComplaint: 'Queixa principal',
  anamnesis: 'Anamnese',
  clinicalEvolution: 'Evolução clínica',
  diagnosis: 'Diagnóstico',
  proceduresPerformed: 'Procedimentos realizados',
  treatmentPlan: 'Plano de tratamento',
  prescription: 'Prescrição',
  recommendations: 'Recomendações',
  privateNotes: 'Notas privadas',
}
