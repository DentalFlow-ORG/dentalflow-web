import type { ClinicalRecordAttachment } from '@/features/clinical-records/types/clinical-record.types'

export function makeAttachment(
  overrides: Partial<ClinicalRecordAttachment> = {},
): ClinicalRecordAttachment {
  return {
    id: 'attachment-1',
    clinicId: 'clinic-1',
    clinicalRecordId: 'record-1',
    fileName: 'radiografia.jpg',
    fileType: 'image/jpeg',
    mimeType: 'image/jpeg',
    sizeBytes: 2048,
    storageKey: null,
    dataBase64: 'aW1hZ2U=',
    thumbnailBase64: 'dGh1bWI=',
    description: null,
    uploadedByUserId: 'user-1',
    createdAt: '2026-06-15T12:00:00Z',
    ...overrides,
  }
}
