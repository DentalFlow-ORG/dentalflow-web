import type { ClinicalRecordStatus } from '../types/clinical-record.types'

export function isClinicalRecordEditable(status: ClinicalRecordStatus) {
  return status === 'DRAFT'
}

export function isClinicalRecordReadOnly(status: ClinicalRecordStatus) {
  return !isClinicalRecordEditable(status)
}

export function getClinicalRecordReadOnlyMessage(status: ClinicalRecordStatus) {
  if (status === 'COMPLETED') {
    return 'Este prontuário foi concluído e está em modo somente leitura.'
  }
  if (status === 'LOCKED') {
    return 'Este prontuário está bloqueado e não pode ser editado.'
  }
  if (status === 'CANCELED') {
    return 'Este prontuário foi cancelado e está em modo somente leitura.'
  }
  return null
}
