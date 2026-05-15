export type PrivacyRequestStatus =
  | 'OPEN'
  | 'IN_REVIEW'
  | 'WAITING_VERIFICATION'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELED'

export type PrivacyRequestType =
  | 'CONFIRM_PROCESSING'
  | 'ACCESS_DATA'
  | 'CORRECT_DATA'
  | 'DELETE_OR_ANONYMIZE'
  | 'PORTABILITY'
  | 'SHARING_INFORMATION'
  | 'REVOKE_CONSENT'
  | 'OTHER'

export type RequesterType = 'PATIENT' | 'CLINIC_OWNER' | 'CLINIC_STAFF' | 'OTHER'

export type PrivacyRequest = {
  id: string
  requestCode: string
  requesterName: string
  requesterEmail?: string
  requesterType: RequesterType
  clinicName?: string | null
  requestType: PrivacyRequestType
  status: PrivacyRequestStatus
  createdAt: string
  updatedAt: string
}

export type AuditLogEntry = {
  id: string
  actorUserId: string | null
  clinicId: string | null
  action: string
  entityType: string | null
  entityId: string | null
  metadata: Record<string, unknown> | null
  ipHash: string | null
  createdAt: string
}

export type CookieConsentLog = {
  id: string
  userId: string | null
  anonymousId: string | null
  categories: {
    necessary: boolean
    preferences: boolean
    analytics: boolean
    marketing: boolean
  }
  policyVersion: string
  source: string
  ipHash: string | null
  createdAt: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type PrivacyRequestFilters = {
  status?: PrivacyRequestStatus | ''
  requestType?: PrivacyRequestType | ''
  requesterType?: RequesterType | ''
  search?: string
  page: number
  limit: number
}

export type AuditLogFilters = {
  action?: string
  actorUserId?: string
  clinicId?: string
  dateFrom?: string
  dateTo?: string
  page: number
  limit: number
}

export type CookieConsentFilters = {
  source?: string
  policyVersion?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  page: number
  limit: number
}
