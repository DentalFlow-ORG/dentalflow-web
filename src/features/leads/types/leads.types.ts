export type LeadStatus = 'NEW' | 'CONTACTED' | 'SCHEDULED' | 'CONVERTED' | 'LOST' | 'ARCHIVED'

export type LeadSource =
  | 'PROFILE_PAGE'
  | 'MANUAL'
  | 'IMPORT'
  | 'REFERRAL'
  | 'WEBSITE'
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'GOOGLE'
  | 'OTHER'

export type LeadActivityAction =
  | 'CREATED'
  | 'STATUS_CHANGED'
  | 'NOTE_ADDED'
  | 'CONTACTED'
  | 'APPOINTMENT_SCHEDULED'
  | 'WHATSAPP_SENT'

export interface LeadAssignedUser {
  id: string
  firstName: string
  lastName: string
}

export interface LeadService {
  id: string
  name: string
}

export interface Lead {
  id: string
  clinicId: string
  name: string
  email: string | null
  phone: string | null
  source: LeadSource
  status: LeadStatus
  message: string | null
  nextFollowUpAt: string | null
  assignedToUserId: string | null
  serviceId: string | null
  createdAt: string
  updatedAt: string
  assignedTo: LeadAssignedUser | null
  service: LeadService | null
}

export interface LeadActivity {
  id: string
  leadId: string
  action: LeadActivityAction
  oldStatus: LeadStatus | null
  newStatus: LeadStatus | null
  note: string | null
  createdAt: string
  user: { id: string; firstName: string; lastName: string } | null
}

export interface LeadSummary {
  new: number
  contacted: number
  scheduled: number
  converted: number
  lost: number
  archived: number
}

export interface LeadListResponse {
  data: Lead[]
  total: number
  page: number
  limit: number
}

export interface CreateLeadPayload {
  name: string
  phone?: string
  email?: string
  source?: LeadSource
  serviceId?: string
  assignedToUserId?: string
  message?: string
  nextFollowUpAt?: string
}

export interface UpdateLeadPayload {
  name?: string
  phone?: string
  email?: string
  source?: LeadSource
  serviceId?: string
  assignedToUserId?: string | null
  message?: string
  nextFollowUpAt?: string | null
}

export interface LeadFilters {
  search: string
  status: LeadStatus | ''
  source: LeadSource | ''
  assignedToUserId: string
  hasFollowUp: boolean
  page: number
  limit: number
}
