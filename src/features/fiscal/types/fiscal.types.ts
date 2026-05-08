export type FiscalDocumentType = 'CPF' | 'CNPJ'
export type FiscalTaxRegime =
  | 'SIMPLES_NACIONAL'
  | 'LUCRO_PRESUMIDO'
  | 'LUCRO_REAL'
  | 'MEI'
  | 'OUTRO'
export type FiscalProvider = 'LOCAL' | 'FOCUS_NFE' | 'NFE_IO' | 'PLUGNOTAS' | 'OTHER'
export type FiscalProviderMode = 'LOCAL' | 'SANDBOX' | 'PRODUCTION'
export type ServiceInvoiceStatus =
  | 'DRAFT'
  | 'READY_TO_ISSUE'
  | 'SIMULATED'
  | 'PROCESSING'
  | 'ISSUED'
  | 'FAILED'
  | 'CANCELED'

export type ClinicFiscalProfile = {
  id: string
  clinicId: string
  legalName: string
  tradeName: string | null
  documentType: FiscalDocumentType
  documentNumber: string
  municipalRegistration: string | null
  stateRegistration: string | null
  taxRegime: FiscalTaxRegime
  specialTaxRegime: string | null
  serviceCode: string | null
  cnae: string | null
  issRate: number | null
  addressStreet: string
  addressNumber: string
  addressComplement: string | null
  addressNeighborhood: string
  addressCity: string
  addressState: string
  addressZipCode: string
  cityIbgeCode: string | null
  fiscalProvider: FiscalProvider
  fiscalProviderMode: FiscalProviderMode
  isConfigured: boolean
  createdAt: string
  updatedAt: string
}

export type FiscalProfileResponse = {
  profile: ClinicFiscalProfile | null
  providerMode: FiscalProviderMode
  realIssuingEnabled: boolean
  message: string
}

export type FiscalSummary = {
  counts: Record<ServiceInvoiceStatus, number>
  monthTotalCents: number
  configurationPending: boolean
  providerMode: FiscalProviderMode
  realIssuingEnabled: boolean
}

export type ServiceInvoice = {
  id: string
  patientId: string | null
  appointmentId: string | null
  status: ServiceInvoiceStatus
  environment: FiscalProviderMode
  isLegalDocument: boolean
  invoiceNumber: string | null
  verificationCode: string | null
  customerName: string
  customerDocument: string | null
  customerEmail: string | null
  customerPhone: string | null
  serviceDescription: string
  serviceCode: string | null
  amountCents: number
  deductionsCents: number | null
  issRate: number | null
  issAmountCents: number | null
  currency: string
  competenceDate: string
  simulatedIssueDate: string | null
  issueDate: string | null
  errorMessage: string | null
  cancellationReason: string | null
  canceledAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  events?: FiscalInvoiceEvent[]
}

export type FiscalInvoiceEvent = {
  id: string
  eventType: string
  previousStatus: ServiceInvoiceStatus | null
  nextStatus: ServiceInvoiceStatus | null
  message: string | null
  createdAt: string
}

export type InvoicesResponse = {
  data: ServiceInvoice[]
  total: number
  page: number
  limit: number
}

export type InvoiceFilters = {
  status?: ServiceInvoiceStatus
  customer?: string
  from?: string
  to?: string
  page: number
  limit: number
}

export type FiscalProfilePayload = Omit<
  ClinicFiscalProfile,
  'id' | 'clinicId' | 'isConfigured' | 'createdAt' | 'updatedAt'
>

export type InvoicePayload = {
  patientId?: string
  appointmentId?: string
  customerName: string
  customerDocument?: string
  customerEmail?: string
  customerPhone?: string
  serviceDescription: string
  serviceCode?: string
  amountCents: number
  deductionsCents?: number
  issRate?: number
  competenceDate: string
  notes?: string
}
