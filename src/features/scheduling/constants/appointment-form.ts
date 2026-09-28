import type { AppointmentPaymentStatus } from '../types/scheduling.types'

// Limits mirror the API DTOs (create-appointment, update-appointment-payment,
// cancel-appointment, availability-exception). The API stays authoritative.
export const PATIENT_NAME_MAX_LENGTH = 100
export const PATIENT_PHONE_MAX_LENGTH = 20
export const APPOINTMENT_NOTES_MAX_LENGTH = 2000
export const PAYMENT_NOTES_MAX_LENGTH = 500
export const CANCELLATION_REASON_MAX_LENGTH = 500

// Radix Select cannot hold an empty value, so "not informed" uses a sentinel.
export const NO_PAYMENT_METHOD = '__NONE__'

export type ClearingPaymentStatus = Extract<
  AppointmentPaymentStatus,
  'PAYMENT_PENDING' | 'CANCELED'
>

// PENDING and CANCELED mean the payment is not settled: the API stores no paid
// amount, payment date or payment method for them. Every save that moves a
// payment into one of these statuses is confirmed first.
export const CLEARING_PAYMENT_STATUSES: readonly ClearingPaymentStatus[] = [
  'PAYMENT_PENDING',
  'CANCELED',
]

export const CLEARING_PAYMENT_ACTION_COPY: Record<
  ClearingPaymentStatus,
  { title: string; description: string; confirmLabel: string }
> = {
  PAYMENT_PENDING: {
    title: 'Marcar pagamento como pendente?',
    description:
      'O valor pago, a data e a forma de pagamento registrados serão removidos. O lançamento financeiro vinculado, se houver, voltará a ficar pendente.',
    confirmLabel: 'Marcar como pendente',
  },
  CANCELED: {
    title: 'Cancelar cobrança?',
    description:
      'A cobrança deste agendamento será cancelada: o valor pago, a data e a forma de pagamento registrados serão removidos, e o lançamento financeiro vinculado, se houver, será cancelado.',
    confirmLabel: 'Cancelar cobrança',
  },
}

// Field messages for the appointment create/edit forms. The forms use
// noValidate, so these render through FormField instead of browser popups.
export const APPOINTMENT_FIELD_MESSAGES = {
  profileRequired: 'Selecione um profissional.',
  patientRequired: 'Selecione um paciente cadastrado ou escolha "Novo paciente".',
  patientNameRequired: 'Informe o nome do paciente.',
  dateRequired: 'Informe a data do agendamento.',
  datePast: 'Escolha uma data de hoje em diante.',
  timeRequired: 'Selecione um horário.',
  timePast: 'Para hoje, escolha um horário igual ou posterior ao horário atual.',
} as const
