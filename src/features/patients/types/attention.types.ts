export type AttentionReason =
  | 'INACTIVE'
  | 'NO_UPCOMING_APPOINTMENT'
  | 'PENDING_PAYMENT'
  | 'RECENTLY_CANCELED'
  | 'RECENT_NO_SHOW'

export type AttentionPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export type PatientAttentionItem = {
  identifier: string
  patientName: string
  patientEmail: string | null
  patientPhone: string | null
  lastAppointmentAt: string | null
  nextAppointmentAt: string | null
  lastProfessionalName: string | null
  reason: AttentionReason
  allReasons: AttentionReason[]
  priority: AttentionPriority
  pendingAmountCents: number
  hasWhatsappConsent: boolean
}

export type AttentionSummary = {
  total: number
  inactive: number
  withoutUpcomingAppointment: number
  pendingPayment: number
  recentlyCanceled: number
  recentNoShow: number
  withWhatsappConsent: number
}

export type AttentionResponse = {
  summary: AttentionSummary
  items: PatientAttentionItem[]
}
