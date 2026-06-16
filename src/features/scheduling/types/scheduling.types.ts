export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED' | 'NO_SHOW'

export type AppointmentPaymentStatus =
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'REFUNDED'
  | 'CANCELED'

export type AppointmentPaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'PIX'
  | 'BANK_TRANSFER'
  | 'HEALTH_INSURANCE'
  | 'OTHER'

export type CanceledBy = 'CLINIC' | 'PATIENT' | 'SYSTEM'

type AppointmentProfile = {
  id: string
  displayName: string
  userId: string | null
}

type AppointmentService = {
  id: string
  name: string
  durationMinutes: number | null
  priceFrom: string | null
  priceTo: string | null
}

type AppointmentPatient = {
  id: string
  firstName: string
  lastName: string
  email: string
}

export type Appointment = {
  id: string
  clinicId: string
  profileId: string
  patientUserId: string | null
  leadId: string | null
  serviceId: string | null
  patientName: string
  patientEmail: string | null
  patientPhone: string | null
  appointmentDate: string | null
  startTime: string | null
  endTime: string | null
  durationMinutes: number | null
  status: AppointmentStatus
  notes: string | null
  patientNotes: string | null
  canceledBy: CanceledBy | null
  canceledAt: string | null
  cancellationReason: string | null
  confirmedAt: string | null
  completedAt: string | null
  estimatedAmountCents: number | null
  paidAmountCents: number | null
  paymentStatus: AppointmentPaymentStatus
  paymentMethod: AppointmentPaymentMethod | null
  paymentDate: string | null
  paymentNotes: string | null
  createdAt: string
  updatedAt: string
  profile: AppointmentProfile | null
  service: AppointmentService | null
  patient: AppointmentPatient | null
}

export type Availability = {
  id: string
  profileId: string
  clinicId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type AvailabilityException = {
  id: string
  profileId: string
  clinicId: string
  exceptionDate: string
  isDayOff: boolean
  startTime: string | null
  endTime: string | null
  reason: string | null
  createdAt: string
  updatedAt: string
}

export type CreateAppointmentDto = {
  profileId: string
  serviceId?: string
  patientUserId?: string
  patientName: string
  patientEmail?: string
  patientPhone: string
  appointmentDate: string
  startTime: string
  durationMinutes?: number
  notes?: string
  estimatedAmountCents?: number
}

export type UpdateAppointmentDto = Partial<Omit<CreateAppointmentDto, 'profileId'>>

export type UpdateAppointmentStatusDto = {
  status: AppointmentStatus
  canceledBy?: CanceledBy
  cancellationReason?: string
}

export type UpdateAppointmentPaymentDto = {
  paymentStatus: AppointmentPaymentStatus
  estimatedAmountCents?: number
  paidAmountCents?: number
  paymentMethod?: AppointmentPaymentMethod
  paymentDate?: string
  paymentNotes?: string
  categoryId?: string
}

export type CreateAvailabilityDto = {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive?: boolean
}

export type UpdateAvailabilityDto = Partial<CreateAvailabilityDto>

export type CreateAvailabilityExceptionDto = {
  exceptionDate: string
  isDayOff?: boolean
  startTime?: string
  endTime?: string
  reason?: string
}

export type UpdateAvailabilityExceptionDto = Partial<
  Omit<CreateAvailabilityExceptionDto, 'exceptionDate'>
>

export type AvailabilitySlot = {
  time: string
  available: boolean
  reason: string | null
}
