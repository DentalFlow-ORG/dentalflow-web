import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'

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
  onChange: <K extends keyof FixedExpenseEditFormState>(field: K, value: FixedExpenseEditFormState[K]) => void
  onSubmit: (event: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <Dialog.Root open={expense !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="edit-fe-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <Dialog.Title id="edit-fe-title" className="text-base font-semibold text-slate-950">
              Editar despesa fixa
            </Dialog.Title>
            <button
              type="button"
              aria-label="Fechar edição de despesa fixa"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form className="space-y-4 px-6 py-5" onSubmit={onSubmit}>
            {error && <InlineFeedback>{error}</InlineFeedback>}

            <FormField label="Categoria" htmlFor="editFeCategory">
              <Select value={form.categoryId} onValueChange={(value) => onChange('categoryId', value)}>
                <SelectTrigger id="editFeCategory">
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

            <FormField label="Descrição" htmlFor="editFeDescription">
              <TextInput
                id="editFeDescription"
                value={form.description}
                maxLength={160}
                onChange={(event) => onChange('description', event.target.value)}
              />
            </FormField>

            <div className="grid items-end gap-4 sm:grid-cols-3">
              <FormField label="Valor" htmlFor="editFeAmount">
                <TextInput
                  id="editFeAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0,00"
                  value={form.amount}
                  onChange={(event) => onChange('amount', event.target.value)}
                />
              </FormField>
              <FormField label="Recorrência" htmlFor="editFeRecurrence">
                <Select
                  value={form.recurrence}
                  onValueChange={(value) => onChange('recurrence', value as FixedExpenseRecurrence)}
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
              <FormField label="Dia" htmlFor="editFeDueDay">
                <TextInput
                  id="editFeDueDay"
                  type="number"
                  min="1"
                  max="31"
                  placeholder="1–31"
                  value={form.dueDay}
                  onChange={(event) => onChange('dueDay', event.target.value)}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Início" htmlFor="editFeStartDate">
                <DatePickerInput
                  id="editFeStartDate"
                  value={form.startDate}
                  onValueChange={(value) => onChange('startDate', value)}
                />
              </FormField>
              <FormField label="Fim" htmlFor="editFeEndDate" optional>
                <DatePickerInput
                  id="editFeEndDate"
                  value={form.endDate}
                  onValueChange={(value) => onChange('endDate', value)}
                />
              </FormField>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar alterações
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
