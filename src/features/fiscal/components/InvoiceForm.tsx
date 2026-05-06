import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'

import type { InvoicePayload } from '../types/fiscal.types'
import { fromMoneyInput, toMoneyInput } from '../utils/invoice-format'

type Props = {
  form: InvoicePayload
  editing: boolean
  onChange: (form: InvoicePayload) => void
  onCancel: () => void
  onSubmit: () => void
}

export function InvoiceForm({ form, editing, onChange, onCancel, onSubmit }: Props) {
  return (
    <PanelCard>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-950">
          {editing ? 'Editar nota fiscal' : 'Criar nota fiscal'}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Este cadastro é um rascunho interno e não possui validade fiscal.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <FormField label="Cliente/Paciente" htmlFor="customerName">
          <TextInput
            id="customerName"
            value={form.customerName}
            onChange={(e) => onChange({ ...form, customerName: e.target.value })}
          />
        </FormField>
        <FormField label="CPF/CNPJ do cliente" htmlFor="customerDocument" optional>
          <TextInput
            id="customerDocument"
            value={form.customerDocument ?? ''}
            onChange={(e) => onChange({ ...form, customerDocument: e.target.value })}
          />
        </FormField>
        <FormField label="E-mail" htmlFor="customerEmail" optional>
          <TextInput
            id="customerEmail"
            type="email"
            value={form.customerEmail ?? ''}
            onChange={(e) => onChange({ ...form, customerEmail: e.target.value })}
          />
        </FormField>
        <FormField label="Telefone" htmlFor="customerPhone" optional>
          <TextInput
            id="customerPhone"
            value={form.customerPhone ?? ''}
            onChange={(e) => onChange({ ...form, customerPhone: e.target.value })}
          />
        </FormField>
        <FormField label="Serviço prestado" htmlFor="serviceDescription" className="lg:col-span-2">
          <TextArea
            id="serviceDescription"
            value={form.serviceDescription}
            onChange={(e) => onChange({ ...form, serviceDescription: e.target.value })}
          />
        </FormField>
        <FormField label="Código de serviço" htmlFor="serviceCode" optional>
          <TextInput
            id="serviceCode"
            value={form.serviceCode ?? ''}
            onChange={(e) => onChange({ ...form, serviceCode: e.target.value })}
          />
        </FormField>
        <FormField label="Valor" htmlFor="amount">
          <TextInput
            id="amount"
            inputMode="decimal"
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
        <FormField label="Observações" htmlFor="notes" optional>
          <TextInput
            id="notes"
            value={form.notes ?? ''}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
          />
        </FormField>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit}>{editing ? 'Salvar alterações' : 'Salvar rascunho'}</Button>
      </div>
    </PanelCard>
  )
}
