import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextInput } from '@/components/common/FormField'
import { formatMoneyInputFromDigits } from '@/lib/money-input'
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
  FinancialTransaction,
  FinancialTransactionStatus,
  FinancialTransactionType,
  TransactionFormState,
} from '../types/finance.types'

export function TransactionEditModal({
  transaction,
  form,
  categories,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: {
  transaction: FinancialTransaction | null
  form: TransactionFormState
  categories: FinancialCategory[]
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof TransactionFormState>(field: K, value: TransactionFormState[K]) => void
  onSubmit: (event: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <Dialog.Root open={transaction !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="edit-tx-title"
          className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] flex-col -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title id="edit-tx-title" className="text-base font-semibold text-foreground">
              Editar lançamento
            </Dialog.Title>
            <button
              type="button"
              aria-label="Fechar edição de lançamento"
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Dialog.Description className="sr-only">
            Atualize os dados do lançamento financeiro selecionado.
          </Dialog.Description>

          <form className="flex min-h-0 flex-col" onSubmit={onSubmit}>
            <div className="app-scrollbar min-h-0 overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                {error && <InlineFeedback>{error}</InlineFeedback>}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Tipo" htmlFor="editTxType">
                    <Select
                      value={form.type}
                      onValueChange={(value) => onChange('type', value as FinancialTransactionType)}
                    >
                      <SelectTrigger id="editTxType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">Entrada</SelectItem>
                        <SelectItem value="EXPENSE">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField label="Status" htmlFor="editTxStatus">
                    <Select
                      value={form.status}
                      onValueChange={(value) => onChange('status', value as FinancialTransactionStatus)}
                    >
                      <SelectTrigger id="editTxStatus">
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

                <FormField label="Categoria" htmlFor="editTxCategory">
                  <Select value={form.categoryId} onValueChange={(value) => onChange('categoryId', value)}>
                    <SelectTrigger id="editTxCategory">
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

                <FormField label="Descrição" htmlFor="editTxDescription">
                  <TextInput
                    id="editTxDescription"
                    value={form.description}
                    maxLength={160}
                    onChange={(event) => onChange('description', event.target.value)}
                  />
                </FormField>

                <div className="grid items-end gap-4 sm:grid-cols-3">
                  <FormField label="Valor" htmlFor="editTxAmount">
                    <TextInput
                      id="editTxAmount"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={form.amount}
                      onChange={(event) => onChange('amount', formatMoneyInputFromDigits(event.target.value))}
                    />
                  </FormField>
                  <FormField label="Data" htmlFor="editTxDate">
                    <DatePickerInput
                      id="editTxDate"
                      value={form.transactionDate}
                      onValueChange={(value) => onChange('transactionDate', value)}
                    />
                  </FormField>
                  <FormField label="Vencimento" htmlFor="editTxDueDate" optional>
                    <DatePickerInput
                      id="editTxDueDate"
                      value={form.dueDate}
                      onValueChange={(value) => onChange('dueDate', value)}
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-border px-6 pb-5 pt-4">
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
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
