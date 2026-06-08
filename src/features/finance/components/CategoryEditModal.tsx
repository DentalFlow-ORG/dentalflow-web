import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'

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
  CategoryFormState,
  FinancialCategory,
  FinancialTransactionType,
} from '../types/finance.types'
import { ColorPicker } from './ColorPicker'

export function CategoryEditModal({
  category,
  form,
  error,
  isSubmitting,
  onChange,
  onSubmit,
  onClose,
}: {
  category: FinancialCategory | null
  form: CategoryFormState
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) => void
  onSubmit: (event: React.FormEvent) => void
  onClose: () => void
}) {
  return (
    <Dialog.Root open={category !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-labelledby="edit-cat-title"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <Dialog.Title id="edit-cat-title" className="text-base font-semibold text-foreground">
              Editar categoria
            </Dialog.Title>
            <button
              type="button"
              aria-label="Fechar edição de categoria"
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Dialog.Description className="sr-only">
            Atualize o nome, tipo e cor da categoria financeira.
          </Dialog.Description>

          <form className="space-y-4 px-6 py-5" onSubmit={onSubmit}>
            {error && <InlineFeedback>{error}</InlineFeedback>}

            <FormField label="Tipo" htmlFor="editCatType">
              <Select
                value={form.type}
                onValueChange={(value) => onChange('type', value as FinancialTransactionType)}
              >
                <SelectTrigger id="editCatType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Entrada</SelectItem>
                  <SelectItem value="EXPENSE">Saída</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Nome" htmlFor="editCatName">
              <TextInput
                id="editCatName"
                value={form.name}
                maxLength={80}
                onChange={(event) => onChange('name', event.target.value)}
              />
            </FormField>

            <FormField label="Cor" htmlFor="editCatColor">
              <ColorPicker value={form.color} onChange={(color) => onChange('color', color)} />
            </FormField>

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
