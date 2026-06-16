type ProductivityActionPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export type ProductivityAction = {
  type: string
  title: string
  description: string
  priority: ProductivityActionPriority
  href: string
}

export type ProductivityAppointmentSummary = {
  id: string
  patientName: string
  startTime: string
  status: string
  paymentStatus: string | null
  profileName: string
  serviceName: string | null
}

export type PendingPaymentAppointment = {
  id: string
  patientName: string
  patientPhone: string | null
  appointmentDate: string
  startTime: string
  estimatedAmountCents: number | null
  paidAmountCents: number | null
  paymentStatus: string
  profileName: string
  serviceName: string | null
}

export type RecentCanceledAppointment = {
  id: string
  patientName: string
  appointmentDate: string
  startTime: string
  cancellationReason: string | null
  profileName: string
}

export type CriticalProduct = {
  id: string
  name: string
  currentQuantity: number
  minQuantity: number
  unit: string
  expiresAt: string | null
  status: 'LOW' | 'EMPTY' | 'EXPIRING' | 'EXPIRED'
  categoryName: string | null
}

export type PatientWithoutReturn = {
  patientName: string
  patientPhone: string | null
  lastVisit: string | null
}

export type ProductivitySummary = {
  today: {
    date: string
    appointmentsTotal: number
    appointmentsConfirmed: number
    appointmentsPending: number
    appointmentsCompleted: number
    appointmentsCanceledOrNoShow: number
    appointmentsCanceled: number
    appointmentsNoShow: number
    pendingPaymentsCount: number
    pendingPaymentsAmountCents: number
  }
  upcomingToday: ProductivityAppointmentSummary[]
  pendingPaymentAppointments: PendingPaymentAppointment[]
  recentCanceled: RecentCanceledAppointment[]
  inventory: {
    lowStockCount: number
    expiringSoonCount: number
    criticalProducts: CriticalProduct[]
  }
  finance: {
    monthIncome: number
    monthExpenses: number
    monthNet: number
    pendingReceivables: number
  }
  patients: {
    withoutReturnCount: number
    examples: PatientWithoutReturn[]
  }
  actions: ProductivityAction[]
}
