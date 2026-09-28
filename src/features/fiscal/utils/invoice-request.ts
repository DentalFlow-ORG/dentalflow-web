import { formatCpfCnpjBR, formatPhoneBR, normalizePhoneBR } from '@/lib/field-formatters'
import { normalizeDigits } from '@/lib/validators/br'

import type { InvoicePayload, InvoiceRequest } from '../types/fiscal.types'

type InvoiceRequestMode = 'create' | 'update'

function optionalText(value: string | undefined, mode: InvoiceRequestMode) {
  const trimmed = value?.trim() ?? ''
  if (trimmed) return trimmed
  // The API skips absent fields on update, so a cleared value must be null.
  return mode === 'update' ? null : undefined
}

/**
 * Converts the form state into the API body: text is trimmed, CPF/CNPJ and
 * phone travel as digits, and empty optional fields never reach the API as ''
 * (an empty e-mail string fails the backend's e-mail validation).
 */
export function buildInvoiceRequest(
  form: InvoicePayload,
  mode: InvoiceRequestMode,
): InvoiceRequest {
  return {
    ...form,
    customerName: form.customerName.trim(),
    serviceDescription: form.serviceDescription.trim(),
    customerDocument: optionalText(normalizeDigits(form.customerDocument ?? ''), mode),
    customerEmail: optionalText(form.customerEmail, mode),
    customerPhone: optionalText(normalizePhoneBR(form.customerPhone), mode),
    serviceCode: optionalText(form.serviceCode, mode),
    notes: optionalText(form.notes, mode),
  }
}

/** Masks stored digits (or legacy masked values) for display in the form. */
export function toInvoiceFormContact(document: string | null, phone: string | null) {
  return {
    customerDocument: document ? formatCpfCnpjBR(document) : '',
    customerPhone: phone ? formatPhoneBR(phone) : '',
  }
}
