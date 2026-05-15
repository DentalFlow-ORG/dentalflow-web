import { Loader2, Scale } from 'lucide-react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { PanelCard } from '@/components/common/PanelCard'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type {
  FinancialCategory,
  FixedExpenseFormState,
  FixedExpenseRecurrence,
} from '../types/finance.types'

export function FixedExpenseForm({
  form,
  categories,
  error,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  form: FixedExpenseFormState
  categories: FinancialCategory[]
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof FixedExpenseFormState>(
    field: K,
    value: FixedExpenseFormState[K],
  ) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  return (
    <PanelCard>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Nova despesa fixa</h2>
          <p className="text-sm text-muted-foreground">Cadastre custos recorrentes da clínica.</p>
        </div>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        {error && <InlineFeedback>{error}</InlineFeedback>}
        <FormField label="Categoria" htmlFor="fixedCategory">
          <Select value={form.categoryId} onValueChange={(value) => onChange('categoryId', value)}>
            <SelectTrigger id="fixedCategory">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Descrição" htmlFor="fixedDescription">
          <TextInput
            id="fixedDescription"
            value={form.description}
            maxLength={160}
            placeholder="Ex.: aluguel da clínica"
            onChange={(event) => onChange('description', event.target.value)}
          />
        </FormField>
        <div className="grid items-start gap-4 sm:grid-cols-3">
          <FormField label="Valor" htmlFor="fixedAmount">
            <TextInput
              id="fixedAmount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              value={form.amount}
              onChange={(event) => onChange('amount', event.target.value)}
            />
          </FormField>
          <FormField label="Recorrência" htmlFor="fixedRecurrence">
            <Select
              value={form.recurrence}
              onValueChange={(value) => onChange('recurrence', value as FixedExpenseRecurrence)}
            >
              <SelectTrigger id="fixedRecurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Mensal</SelectItem>
                <SelectItem value="WEEKLY">Semanal</SelectItem>
                <SelectItem value="YEARLY">Anual</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Dia" htmlFor="fixedDueDay">
            <TextInput
              id="fixedDueDay"
              type="number"
              min="1"
              max="31"
              placeholder="1–31"
              value={form.dueDay}
              onChange={(event) => onChange('dueDay', event.target.value)}
            />
          </FormField>
        </div>
        <FormField label="Início" htmlFor="fixedStartDate">
          <DatePickerInput
            id="fixedStartDate"
            value={form.startDate}
            onValueChange={(value) => onChange('startDate', value)}
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar despesa fixa
        </Button>
      </form>
    </PanelCard>
  )
}
