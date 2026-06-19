import type { ClinicalRecordStatus } from '../types/clinical-record.types'

export function isClinicalRecordEditable(status: ClinicalRecordStatus) {
  return status === 'DRAFT'
}

export function isClinicalRecordReadOnly(status: ClinicalRecordStatus) {
  return !isClinicalRecordEditable(status)
}
