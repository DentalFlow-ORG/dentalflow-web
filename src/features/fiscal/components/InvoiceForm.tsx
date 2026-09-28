import { Loader2 } from 'lucide-react'
import { useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { formatCpfCnpjBR, formatPhoneBR } from '@/lib/field-formatters'
import {
  centsToMoneyInput,
  formatMoneyInputFromDigits,
  parseMoneyInputToCents,
} from '@/lib/money-input'
import { isValidBrazilianPhone, isValidCpfOrCnpj } from '@/lib/validators/br'
import { EMAIL_MAX_LENGTH, INVALID_EMAIL_MESSAGE, isValidEmail } from '@/lib/validators/email'

import { INVOICE_FIELD_LIMITS } from '../constants/invoice-field-limits'
import type { InvoicePayload } from '../types/fiscal.types'

type InvoiceErrorField =
  | 'customerName'
  | 'customerDocument'
  | 'customerEmail'
  | 'customerPhone'
  | 'serviceDescription'
  | 'amount'
  | 'competenceDate'

type InvoiceErrors = Partial<Record<InvoiceErrorField, string>>

function validateInvoice(form: InvoicePayload): InvoiceErrors {
  const errors: InvoiceErrors = {}
  if (!form.customerName.trim()) {
    errors.customerName = 'Informe o nome do cliente ou paciente.'
  }
  const doc = form.customerDocument?.trim() ?? ''
  if (doc && !isValidCpfOrCnpj(doc)) {
    errors.customerDocument = 'Informe um CPF ou CNPJ válido.'
  }
  const email = form.customerEmail?.trim() ?? ''
  if (email && !isValidEmail(email)) {
    errors.customerEmail = INVALID_EMAIL_MESSAGE
  }
  const phone = form.customerPhone?.trim() ?? ''
  if (phone && !isValidBrazilianPhone(phone)) {
    errors.customerPhone = 'Informe um telefone válido com DDD.'
  }
  if (!form.serviceDescription.trim()) {
    errors.serviceDescription = 'Descreva o serviço prestado.'
  }
  if (form.amountCents <= 0) {
    errors.amount = 'Informe um valor maior que zero.'
  }
  if (!form.competenceDate) {
    errors.competenceDate = 'Informe a data de competência.'
  }
  return errors
}

type Props = {
  form: InvoicePayload
  editing: boolean
  isSaving?: boolean
  onChange: (form: InvoicePayload) => void
  onCancel: () => void
  onSubmit: () => void
}

export function InvoiceForm({
  form,
  editing,
  isSaving = false,
  onChange,
  onCancel,
  onSubmit,
}: Props) {
  const [errors, setErrors] = useState<InvoiceErrors>({})

  function handleChange(updated: InvoicePayload, field: InvoiceErrorField) {
    onChange(updated)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit() {
    if (isSaving) return
    const fieldErrors = validateInvoice(form)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit()
  }

  return (
    <PanelCard>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">
          {editing ? 'Editar nota fiscal' : 'Criar nota fiscal'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Este cadastro é um rascunho interno e não possui validade fiscal.
        </p>
      </div>

      <div className="space-y-6">
        {/* Tomador */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tomador
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Cliente/Paciente" htmlFor="customerName" error={errors.customerName}>
              <TextInput
                id="customerName"
                placeholder="Nome do cliente ou paciente"
                value={form.customerName}
                maxLength={INVOICE_FIELD_LIMITS.customerName}
                aria-invalid={Boolean(errors.customerName)}
                aria-describedby={errors.customerName ? 'customerName-error' : undefined}
                onChange={(e) =>
                  handleChange({ ...form, customerName: e.target.value }, 'customerName')
                }
              />
            </FormField>
            <FormField
              label="CPF/CNPJ do cliente"
              htmlFor="customerDocument"
              optional
              error={errors.customerDocument}
            >
              <TextInput
                id="customerDocument"
                inputMode="numeric"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                value={form.customerDocument ?? ''}
                onChange={(e) =>
                  handleChange(
                    { ...form, customerDocument: formatCpfCnpjBR(e.target.value) },
                    'customerDocument',
                  )
                }
                maxLength={18}
                aria-invalid={Boolean(errors.customerDocument)}
                aria-describedby={errors.customerDocument ? 'customerDocument-error' : undefined}
              />
            </FormField>
            <FormField label="E-mail" htmlFor="customerEmail" optional error={errors.customerEmail}>
              <TextInput
                id="customerEmail"
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="nome@exemplo.com"
                value={form.customerEmail ?? ''}
                maxLength={EMAIL_MAX_LENGTH}
                aria-invalid={Boolean(errors.customerEmail)}
                aria-describedby={errors.customerEmail ? 'customerEmail-error' : undefined}
                onChange={(e) =>
                  handleChange({ ...form, customerEmail: e.target.value }, 'customerEmail')
                }
              />
            </FormField>
            <FormField
              label="Telefone"
              htmlFor="customerPhone"
              optional
              error={errors.customerPhone}
            >
              <TextInput
                id="customerPhone"
                type="tel"
                inputMode="tel"
                autoComplete="off"
                placeholder="(00) 00000-0000"
                value={form.customerPhone ?? ''}
                onChange={(e) =>
                  handleChange(
                    { ...form, customerPhone: formatPhoneBR(e.target.value) },
                    'customerPhone',
                  )
                }
                aria-invalid={Boolean(errors.customerPhone)}
                aria-describedby={errors.customerPhone ? 'customerPhone-error' : undefined}
              />
            </FormField>
          </div>
        </div>

        {/* Serviço */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Serviço
          </p>
          <FormField
            label="Serviço prestado"
            htmlFor="serviceDescription"
            error={errors.serviceDescription}
          >
            <TextArea
              id="serviceDescription"
              placeholder="Descreva o serviço prestado..."
              value={form.serviceDescription}
              maxLength={INVOICE_FIELD_LIMITS.serviceDescription}
              aria-invalid={Boolean(errors.serviceDescription)}
              aria-describedby={errors.serviceDescription ? 'serviceDescription-error' : undefined}
              onChange={(e) =>
                handleChange({ ...form, serviceDescription: e.target.value }, 'serviceDescription')
              }
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Código de serviço" htmlFor="serviceCode" optional>
              <TextInput
                id="serviceCode"
                placeholder="Ex: 04.12 ou código municipal"
                value={form.serviceCode ?? ''}
                maxLength={INVOICE_FIELD_LIMITS.serviceCode}
                onChange={(e) => onChange({ ...form, serviceCode: e.target.value })}
              />
            </FormField>
            <FormField label="Valor" htmlFor="amount" error={errors.amount}>
              <TextInput
                id="amount"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={centsToMoneyInput(form.amountCents)}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                onChange={(e) =>
                  handleChange(
                    {
                      ...form,
                      amountCents: parseMoneyInputToCents(
                        formatMoneyInputFromDigits(e.target.value),
                      ),
                    },
                    'amount',
                  )
                }
              />
            </FormField>
            <FormField
              label="Data de competência"
              htmlFor="competenceDate"
              error={errors.competenceDate}
            >
              <DatePickerInput
                id="competenceDate"
                value={form.competenceDate}
                invalid={Boolean(errors.competenceDate)}
                onValueChange={(value) =>
                  handleChange({ ...form, competenceDate: value }, 'competenceDate')
                }
              />
            </FormField>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Observações
          </p>
          <FormField label="Observações" htmlFor="notes" optional>
            <TextArea
              id="notes"
              placeholder="Informações adicionais sobre a nota..."
              value={form.notes ?? ''}
              maxLength={INVOICE_FIELD_LIMITS.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
            />
          </FormField>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSaving} className="w-full sm:w-auto">
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSaving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar rascunho'}
        </Button>
      </div>
    </PanelCard>
  )
}
