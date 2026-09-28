import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { financeFieldErrors } from '../utils/finance-form-rules'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
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
  FixedExpense,
  FixedExpenseEditFormState,
  FixedExpenseRecurrence,
} from '../types/finance.types'

export function FixedExpenseEditModal({
  expense,
  form,
  categories,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: {
  expense: FixedExpense | null
  form: FixedExpenseEditFormState
  categories: FinancialCategory[]
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof FixedExpenseEditFormState>(
    field: K,
    value: FixedExpenseEditFormState[K],
  ) => void
  onSubmit: (event: React.FormEvent) => void
  onClose: () => void
}) {
  const fieldErrors = financeFieldErrors(form, error)

  return (
    <Dialog.Root open={expense !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="edit-fe-title"
          className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] flex-col -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title id="edit-fe-title" className="text-base font-semibold text-foreground">
              Editar despesa fixa
            </Dialog.Title>
            <button
              type="button"
              aria-label="Fechar edição de despesa fixa"
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Dialog.Description className="sr-only">
            Atualize os dados da despesa fixa recorrente.
          </Dialog.Description>

          <form noValidate className="flex min-h-0 flex-col" onSubmit={onSubmit}>
            <div className="app-scrollbar min-h-0 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {error && <InlineFeedback>{error}</InlineFeedback>}

                <FormField
                  label="Categoria"
                  htmlFor="editFeCategory"
                  error={fieldErrors.categoryId}
                >
                  <Select
                    value={form.categoryId}
                    onValueChange={(value) => onChange('categoryId', value)}
                  >
                    <SelectTrigger
                      id="editFeCategory"
                      aria-invalid={Boolean(fieldErrors.categoryId)}
                      aria-describedby={fieldErrors.categoryId ? 'editFeCategory-error' : undefined}
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

                <FormField
                  label="Descrição"
                  htmlFor="editFeDescription"
                  error={fieldErrors.description}
                >
                  <TextInput
                    id="editFeDescription"
                    aria-invalid={Boolean(fieldErrors.description)}
                    aria-describedby={
                      fieldErrors.description ? 'editFeDescription-error' : undefined
                    }
                    placeholder="Ex.: aluguel da clínica"
                    value={form.description}
                    maxLength={FINANCE_FIELD_LIMITS.description}
                    onChange={(event) => onChange('description', event.target.value)}
                  />
                </FormField>

                <div className="grid items-start gap-4 sm:grid-cols-3">
                  <FormField label="Valor" htmlFor="editFeAmount" error={fieldErrors.amount}>
                    <TextInput
                      id="editFeAmount"
                      aria-invalid={Boolean(fieldErrors.amount)}
                      aria-describedby={fieldErrors.amount ? 'editFeAmount-error' : undefined}
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
                  <FormField label="Recorrência" htmlFor="editFeRecurrence">
                    <Select
                      value={form.recurrence}
                      onValueChange={(value) =>
                        onChange('recurrence', value as FixedExpenseRecurrence)
                      }
                    >
                      <SelectTrigger id="editFeRecurrence">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Mensal</SelectItem>
                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                        <SelectItem value="YEARLY">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Dia" htmlFor="editFeDueDay" error={fieldErrors.dueDay}>
                    <TextInput
                      id="editFeDueDay"
                      aria-invalid={Boolean(fieldErrors.dueDay)}
                      aria-describedby={fieldErrors.dueDay ? 'editFeDueDay-error' : undefined}
                      inputMode="numeric"
                      maxLength={2}
                      placeholder="1–31"
                      value={form.dueDay}
                      onChange={(event) =>
                        onChange('dueDay', event.target.value.replace(/\D/g, ''))
                      }
                    />
                  </FormField>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Início" htmlFor="editFeStartDate" error={fieldErrors.startDate}>
                    <DatePickerInput
                      id="editFeStartDate"
                      invalid={Boolean(fieldErrors.startDate)}
                      value={form.startDate}
                      onValueChange={(value) => onChange('startDate', value)}
                    />
                  </FormField>
                  <FormField
                    label="Fim"
                    htmlFor="editFeEndDate"
                    error={fieldErrors.endDate}
                    optional
                  >
                    <DatePickerInput
                      id="editFeEndDate"
                      invalid={Boolean(fieldErrors.endDate)}
                      value={form.endDate}
                      onValueChange={(value) => onChange('endDate', value)}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-border px-6 pb-5 pt-4">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Salvar alterações
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
