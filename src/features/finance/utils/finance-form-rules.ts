import { parseMoneyInputToCents } from '@/lib/money-input'
import { FINANCE_FIELD_MESSAGES } from '../constants/finance-form'

type AmountDescriptionForm = {
  categoryId: string
  amount: string
  description: string
  transactionDate?: string
  startDate?: string
}

/** Category, a positive amount and a non-blank description are always required. */
export function hasRequiredFinanceFields(form: AmountDescriptionForm): boolean {
  return (
    Boolean(form.categoryId) &&
    parseMoneyInputToCents(form.amount) > 0 &&
    form.description.trim().length > 0 &&
    (!('transactionDate' in form) || Boolean(form.transactionDate)) &&
    (!('startDate' in form) || Boolean(form.startDate))
  )
}

/** Due day of a recurring expense: an integer from 1 to 31. */
export function isValidDueDay(value: string): boolean {
  if (!/^\d{1,2}$/.test(value)) return false
  const day = Number(value)
  return day >= 1 && day <= 31
}

/** ISO dates compare lexicographically; an empty end date means "no end". */
export function isEndDateOnOrAfterStart(startDate: string, endDate: string): boolean {
  return !endDate || !startDate || endDate >= startDate
}

/** Links the existing submit error to fields that actually violate the form rules. */
export function financeFieldErrors(
  form: Partial<
    Record<
      | 'name'
      | 'categoryId'
      | 'amount'
      | 'description'
      | 'transactionDate'
      | 'startDate'
      | 'endDate'
      | 'dueDay',
      string
    >
  >,
  error: string | null,
): Partial<Record<keyof typeof form, string>> {
  if (!error) return {}
  const errors: Partial<Record<keyof typeof form, string>> = {}
  for (const field of [
    'name',
    'categoryId',
    'description',
    'transactionDate',
    'startDate',
  ] as const) {
    if (form[field] !== undefined && !form[field].trim())
      errors[field] = FINANCE_FIELD_MESSAGES[field]
  }
  if (form.amount !== undefined && parseMoneyInputToCents(form.amount) <= 0)
    errors.amount = FINANCE_FIELD_MESSAGES.amount
  if (form.dueDay !== undefined && !isValidDueDay(form.dueDay))
    errors.dueDay = FINANCE_FIELD_MESSAGES.dueDay
  if (form.startDate && form.endDate && !isEndDateOnOrAfterStart(form.startDate, form.endDate))
    errors.endDate = FINANCE_FIELD_MESSAGES.endDate
  return errors
}
