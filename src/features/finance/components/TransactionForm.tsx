import { Loader2, Plus } from 'lucide-react'
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
  FinancialTransactionStatus,
  FinancialTransactionType,
  TransactionFormState,
} from '../types/finance.types'

export function TransactionForm({
  form,
  categories,
  error,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  form: TransactionFormState
  categories: FinancialCategory[]
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof TransactionFormState>(field: K, value: TransactionFormState[K]) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  const fieldErrors = financeFieldErrors(form, error)

  return (
    <PanelCard>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Plus className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Novo lançamento</h2>
          <p className="text-sm text-muted-foreground">Registre entradas ou despesas manuais.</p>
        </div>
      </div>
      <form noValidate className="space-y-5" onSubmit={onSubmit}>
        {error && <InlineFeedback>{error}</InlineFeedback>}

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Classificação
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Tipo" htmlFor="transactionType">
              <Select
                value={form.type}
                onValueChange={(value) => onChange('type', value as FinancialTransactionType)}
              >
                <SelectTrigger id="transactionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Entrada</SelectItem>
                  <SelectItem value="EXPENSE">Saída</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Status" htmlFor="transactionStatus">
              <Select
                value={form.status}
                onValueChange={(value) => onChange('status', value as FinancialTransactionStatus)}
              >
                <SelectTrigger id="transactionStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Pago</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CANCELED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Categoria" htmlFor="transactionCategory" error={fieldErrors.categoryId}>
            <Select
              value={form.categoryId}
              onValueChange={(value) => onChange('categoryId', value)}
            >
              <SelectTrigger
                id="transactionCategory"
                aria-invalid={Boolean(fieldErrors.categoryId)}
                aria-describedby={fieldErrors.categoryId ? 'transactionCategory-error' : undefined}
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
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Valor e datas
          </p>
          <div className="grid items-start gap-4 sm:grid-cols-3">
            <FormField label="Valor" htmlFor="transactionAmount" error={fieldErrors.amount}>
              <TextInput
                id="transactionAmount"
                aria-invalid={Boolean(fieldErrors.amount)}
                aria-describedby={fieldErrors.amount ? 'transactionAmount-error' : undefined}
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
            <FormField label="Data" htmlFor="transactionDate" error={fieldErrors.transactionDate}>
              <DatePickerInput
                id="transactionDate"
                invalid={Boolean(fieldErrors.transactionDate)}
                value={form.transactionDate}
                onValueChange={(value) => onChange('transactionDate', value)}
              />
            </FormField>
            <FormField label="Vencimento" htmlFor="transactionDueDate" optional>
              <DatePickerInput
                id="transactionDueDate"
                value={form.dueDate}
                onValueChange={(value) => onChange('dueDate', value)}
              />
            </FormField>
          </div>
          <FormField
            label="Descrição"
            htmlFor="transactionDescription"
            error={fieldErrors.description}
          >
            <TextInput
              id="transactionDescription"
              aria-invalid={Boolean(fieldErrors.description)}
              aria-describedby={
                fieldErrors.description ? 'transactionDescription-error' : undefined
              }
              value={form.description}
              maxLength={FINANCE_FIELD_LIMITS.description}
              placeholder="Ex.: pagamento de clareamento"
              onChange={(event) => onChange('description', event.target.value)}
            />
          </FormField>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar lançamento
        </Button>
      </form>
    </PanelCard>
  )
}
