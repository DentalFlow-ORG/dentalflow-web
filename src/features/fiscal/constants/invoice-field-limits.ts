// Mirrors the API's invoice DTO limits (modules/fiscal/dto/invoice.dto.ts).
export const INVOICE_FIELD_LIMITS = {
  customerName: 150,
  serviceDescription: 2000,
  serviceCode: 50,
  notes: 2000,
  cancelReason: 500,
} as const
