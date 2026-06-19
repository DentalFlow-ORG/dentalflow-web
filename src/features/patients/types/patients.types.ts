export interface PatientSummary {
  identifier: string
  patientName: string
  patientEmail: string | null
  patientPhone: string | null
  totalAppointments: number
  completedAppointments: number
  canceledAppointments: number
  lastVisit: string | null
  avatarUrl?: string | null
}

export interface PatientsListResponse {
  data: PatientSummary[]
  total: number
}

export interface PatientAppointment {
  id: string
  appointmentDate: string
  startTime: string
  endTime: string
  status: string
  patientName: string
  patientEmail: string | null
  patientPhone: string | null
  notes: string | null
  service: { id: string; name: string } | null
  profile: { id: string; displayName: string } | null
}

export interface PatientHistoryResponse {
  appointments: PatientAppointment[]
}
