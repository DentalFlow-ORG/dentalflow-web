import { Loader2, Scale } from 'lucide-react'
import { financeFieldErrors } from '../utils/finance-form-rules'

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
import { formatMoneyInputFromDigits } from '@/lib/money-input'

import { FINANCE_FIELD_LIMITS, FINANCE_MAX_AMOUNT_CENTS } from '../constants/finance-form'
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
  const fieldErrors = financeFieldErrors(form, error)

  return (
    <PanelCard>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-900/35 dark:text-red-300">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Nova despesa fixa</h2>
          <p className="text-sm text-muted-foreground">Cadastre custos recorrentes da clínica.</p>
        </div>
      </div>
      <form noValidate className="space-y-5" onSubmit={onSubmit}>
        {error && <InlineFeedback>{error}</InlineFeedback>}

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Identificação
          </p>
          <FormField label="Categoria" htmlFor="fixedCategory" error={fieldErrors.categoryId}>
            <Select
              value={form.categoryId}
              onValueChange={(value) => onChange('categoryId', value)}
            >
              <SelectTrigger
                id="fixedCategory"
                aria-invalid={Boolean(fieldErrors.categoryId)}
                aria-describedby={fieldErrors.categoryId ? 'fixedCategory-error' : undefined}
              >
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
          <FormField label="Descrição" htmlFor="fixedDescription" error={fieldErrors.description}>
            <TextInput
              id="fixedDescription"
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={fieldErrors.description ? 'fixedDescription-error' : undefined}
              value={form.description}
              maxLength={FINANCE_FIELD_LIMITS.description}
              placeholder="Ex.: aluguel da clínica"
              onChange={(event) => onChange('description', event.target.value)}
            />
          </FormField>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recorrência
          </p>
          <div className="grid items-start gap-4 sm:grid-cols-3">
            <FormField label="Valor" htmlFor="fixedAmount" error={fieldErrors.amount}>
              <TextInput
                id="fixedAmount"
                aria-invalid={Boolean(fieldErrors.amount)}
                aria-describedby={fieldErrors.amount ? 'fixedAmount-error' : undefined}
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={form.amount}
                onChange={(event) =>
                  onChange(
                    'amount',
                    formatMoneyInputFromDigits(event.target.value, FINANCE_MAX_AMOUNT_CENTS),
                  )
                }
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
            <FormField label="Dia" htmlFor="fixedDueDay" error={fieldErrors.dueDay}>
              <TextInput
                id="fixedDueDay"
                aria-invalid={Boolean(fieldErrors.dueDay)}
                aria-describedby={fieldErrors.dueDay ? 'fixedDueDay-error' : undefined}
                inputMode="numeric"
                maxLength={2}
                placeholder="1–31"
                value={form.dueDay}
                onChange={(event) => onChange('dueDay', event.target.value.replace(/\D/g, ''))}
              />
            </FormField>
          </div>
          <FormField label="Início" htmlFor="fixedStartDate" error={fieldErrors.startDate}>
            <DatePickerInput
              id="fixedStartDate"
              invalid={Boolean(fieldErrors.startDate)}
              value={form.startDate}
              onValueChange={(value) => onChange('startDate', value)}
            />
          </FormField>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar despesa fixa
        </Button>
      </form>
    </PanelCard>
  )
}
