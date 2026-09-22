export type ClinicalRecordStatus = 'DRAFT' | 'COMPLETED' | 'LOCKED' | 'CANCELED'
export type ClinicalTemplateCategory =
  | 'ANAMNESIS'
  | 'EVOLUTION'
  | 'PRESCRIPTION'
  | 'RECOMMENDATION'
  | 'PROCEDURE'
  | 'OTHER'

type ClinicalRecordProfile = {
  id: string
  displayName: string
  userId: string | null
}

type ClinicalRecordAppointment = {
  id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  service: { id: string; name: string } | null
}

type ClinicalRecordUser = {
  id: string
  firstName: string
  lastName: string
}

export type ClinicalRecordAttachment = {
  id: string
  clinicId: string
  clinicalRecordId: string
  fileName: string
  fileType: string | null
  mimeType: string | null
  sizeBytes: number | null
  storageKey: string | null
  dataBase64: string | null
  thumbnailBase64: string | null
  description: string | null
  uploadedByUserId: string
  createdAt: string
}

export type ClinicalRecord = {
  id: string
  clinicId: string
  appointmentId: string | null
  profileId: string
  /**
   * Stable clinical identity. Null for records that predate the identity
   * migration; those still resolve through the patient contact fields.
   */
  patientId: string | null
  patientName: string
  patientEmail: string | null
  patientPhone: string | null
  status: ClinicalRecordStatus
  chiefComplaint: string | null
  anamnesis: string | null
  clinicalEvolution: string | null
  diagnosis: string | null
  proceduresPerformed: string | null
  treatmentPlan: string | null
  prescription: string | null
  recommendations: string | null
  privateNotes: string | null
  aiDraft: string | null
  aiSummary: string | null
  odontogramSnapshot: unknown | null
  printedAt: string | null
  completedAt: string | null
  lockedAt: string | null
  createdByUserId: string
  updatedByUserId: string | null
  createdAt: string
  updatedAt: string
  profile: ClinicalRecordProfile
  appointment: ClinicalRecordAppointment | null
  createdByUser: ClinicalRecordUser
  updatedByUser: ClinicalRecordUser | null
  attachments?: ClinicalRecordAttachment[]
}

export type ClinicalTemplate = {
  id: string
  clinicId: string
  name: string
  category: ClinicalTemplateCategory
  content: string
  isActive: boolean
  createdByUserId: string
  createdAt: string
  updatedAt: string
}

export type OdontogramTooth = {
  condition?: string
  surfaces?: Record<string, string>
  notes?: string
}

export type OdontogramData = {
  teeth: Record<string, OdontogramTooth>
  notes?: string
  updatedAt?: string
}

export type OdontogramRecord = {
  id: string
  clinicId: string
  patientEmail: string | null
  patientName: string
  data: OdontogramData
  createdByUserId: string
  createdAt: string
  updatedAt: string
}

export type PatientClinicalTimeline = {
  identifier: string
  records: ClinicalRecord[]
}

export type PrintData = {
  clinic: {
    name: string
    email: string | null
    phone: string | null
    addressLine1: string | null
    city: string | null
    state: string | null
  } | null
  record: ClinicalRecord & { attachments: ClinicalRecordAttachment[] }
}

export type CreateClinicalRecordDto = {
  patientId?: string
  appointmentId?: string
  profileId: string
  patientName: string
  patientEmail?: string
  patientPhone?: string
  chiefComplaint?: string
  anamnesis?: string
  clinicalEvolution?: string
  diagnosis?: string
  proceduresPerformed?: string
  treatmentPlan?: string
  prescription?: string
  recommendations?: string
  privateNotes?: string
}

export type UpdateClinicalRecordDto = Partial<
  Pick<
    CreateClinicalRecordDto,
    | 'patientName'
    | 'patientEmail'
    | 'patientPhone'
    | 'chiefComplaint'
    | 'anamnesis'
    | 'clinicalEvolution'
    | 'diagnosis'
    | 'proceduresPerformed'
    | 'treatmentPlan'
    | 'prescription'
    | 'recommendations'
    | 'privateNotes'
  > & { aiDraft?: string }
>

export type CreateClinicalTemplateDto = {
  name: string
  category: ClinicalTemplateCategory
  content: string
  isActive?: boolean
}

export type UpdateClinicalTemplateDto = Partial<CreateClinicalTemplateDto>
