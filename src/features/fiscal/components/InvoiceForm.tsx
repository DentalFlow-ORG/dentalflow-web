import { useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import { formatCpfCnpjBR, formatPhoneBR } from '@/lib/field-formatters'
import { isValidBrazilianPhone, isValidCpfOrCnpj } from '@/lib/validators/br'

import type { InvoicePayload } from '../types/fiscal.types'
import { fromMoneyInput, toMoneyInput } from '../utils/invoice-format'

type InvoiceErrors = {
  customerDocument?: string
  customerPhone?: string
}

function validateInvoice(form: InvoicePayload): InvoiceErrors {
  const errors: InvoiceErrors = {}
  const doc = form.customerDocument?.trim() ?? ''
  if (doc && !isValidCpfOrCnpj(doc)) {
    errors.customerDocument = 'Informe um CPF ou CNPJ válido.'
  }
  const phone = form.customerPhone?.trim() ?? ''
  if (phone && !isValidBrazilianPhone(phone)) {
    errors.customerPhone = 'Informe um telefone válido com DDD.'
  }
  return errors
}

type Props = {
  form: InvoicePayload
  editing: boolean
  onChange: (form: InvoicePayload) => void
  onCancel: () => void
  onSubmit: () => void
}

export function InvoiceForm({ form, editing, onChange, onCancel, onSubmit }: Props) {
  const [errors, setErrors] = useState<InvoiceErrors>({})

  function handleChange(updated: InvoicePayload, field?: keyof InvoiceErrors) {
    onChange(updated)
    if (field && field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function handleSubmit() {
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
            <FormField label="Cliente/Paciente" htmlFor="customerName">
              <TextInput
                id="customerName"
                value={form.customerName}
                onChange={(e) => onChange({ ...form, customerName: e.target.value })}
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
              />
            </FormField>
            <FormField label="E-mail" htmlFor="customerEmail" optional>
              <TextInput
                id="customerEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={form.customerEmail ?? ''}
                onChange={(e) => onChange({ ...form, customerEmail: e.target.value })}
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
                placeholder="(00) 00000-0000"
                value={form.customerPhone ?? ''}
                onChange={(e) =>
                  handleChange(
                    { ...form, customerPhone: formatPhoneBR(e.target.value) },
                    'customerPhone',
                  )
                }
                maxLength={15}
                aria-invalid={Boolean(errors.customerPhone)}
              />
            </FormField>
          </div>
        </div>

        {/* Serviço */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Serviço
          </p>
          <FormField label="Serviço prestado" htmlFor="serviceDescription">
            <TextArea
              id="serviceDescription"
              value={form.serviceDescription}
              onChange={(e) => onChange({ ...form, serviceDescription: e.target.value })}
            />
          </FormField>
          <div className="grid gap-3 sm:grid-cols-3">
            <FormField label="Código de serviço" htmlFor="serviceCode" optional>
              <TextInput
                id="serviceCode"
                placeholder="Ex: 04.12 ou código municipal"
                value={form.serviceCode ?? ''}
                onChange={(e) => onChange({ ...form, serviceCode: e.target.value })}
              />
            </FormField>
            <FormField label="Valor" htmlFor="amount">
              <TextInput
                id="amount"
                inputMode="numeric"
                value={toMoneyInput(form.amountCents)}
                onChange={(e) => onChange({ ...form, amountCents: fromMoneyInput(e.target.value) })}
              />
            </FormField>
            <FormField label="Data de competência" htmlFor="competenceDate">
              <DatePickerInput
                id="competenceDate"
                value={form.competenceDate}
                onValueChange={(value) => onChange({ ...form, competenceDate: value })}
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
            <TextInput
              id="notes"
              value={form.notes ?? ''}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
            />
          </FormField>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} className="w-full sm:w-auto">
          {editing ? 'Salvar alterações' : 'Salvar rascunho'}
        </Button>
      </div>
    </PanelCard>
  )
}
