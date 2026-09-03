import {
  isClinicalRecordEditable,
  isClinicalRecordReadOnly,
} from '@/features/clinical-records/utils/clinical-record-status-rules'

describe('isClinicalRecordEditable', () => {
  it('is true only for DRAFT', () => {
    expect(isClinicalRecordEditable('DRAFT')).toBe(true)
    expect(isClinicalRecordEditable('COMPLETED')).toBe(false)
    expect(isClinicalRecordEditable('LOCKED')).toBe(false)
    expect(isClinicalRecordEditable('CANCELED')).toBe(false)
  })
})

describe('isClinicalRecordReadOnly', () => {
  it('is the inverse of isClinicalRecordEditable', () => {
    expect(isClinicalRecordReadOnly('DRAFT')).toBe(false)
    expect(isClinicalRecordReadOnly('COMPLETED')).toBe(true)
    expect(isClinicalRecordReadOnly('LOCKED')).toBe(true)
    expect(isClinicalRecordReadOnly('CANCELED')).toBe(true)
  })
})
