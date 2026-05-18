export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL'
export type NotificationScope = 'UTILITY' | 'MARKETING'
export type NotificationStatus =
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'CONFIRMED'
  | 'FAILED'
  | 'OPTED_OUT'
export type NotificationTemplateCategory = 'UTILITY' | 'MARKETING' | 'SERVICE'
export type ConsentSource = 'MANUAL' | 'FORM' | 'IMPORT'

export type NotificationTemplate = {
  id: string
  slug: string
  channel: NotificationChannel
  category: NotificationTemplateCategory
  bodyPt: string
  variables: string[]
}

export type NotificationConsent = {
  id: string
  phone: string
  channel: NotificationChannel
  scope: NotificationScope
  granted: boolean
  grantedAt: string | null
  revokedAt: string | null
  source: ConsentSource
  patientUserId: string | null
  entityType: string | null
  entityId: string | null
  createdAt: string
  updatedAt: string
}

export type NotificationProviderType = 'local' | 'whatsapp_cloud'

export type NotificationPreference = {
  clinicId: string
  whatsappEnabled: boolean
  autoReminder: boolean
  autoConfirmation: boolean
  reminderHoursBefore: number
  createdAt: string | null
  updatedAt: string | null
  /** Provider type resolved server-side from NOTIFICATION_PROVIDER env var */
  providerType?: NotificationProviderType
  providerConfigured?: boolean
}

export type NotificationQuota = {
  month: string
  channel: NotificationChannel
  used: number
  limit: number
  available: number
}

export type NotificationMessage = {
  id: string
  templateSlug: string
  channel: NotificationChannel
  scope: NotificationScope
  status: NotificationStatus
  appointmentId: string | null
  sentAt: string | null
  failedAt: string | null
  failReason: string | null
  createdAt: string
}

export type NotificationMessagesResponse = {
  data: NotificationMessage[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type SendNotificationRequest = {
  templateSlug: string
  phone: string
  appointmentId?: string
}

export type SendNotificationResponse = {
  id: string
  status: NotificationStatus
  templateSlug: string
  sentAt: string | null
}

export type CreateConsentRequest = {
  phone: string
  channel: NotificationChannel
  scope: NotificationScope
  granted: boolean
  source: ConsentSource
  patientUserId?: string
  entityType?: string
  entityId?: string
}
