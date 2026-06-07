import { Layers, Loader2 } from 'lucide-react'

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

import type { CategoryFormState, FinancialTransactionType } from '../types/finance.types'
import { ColorPicker } from './ColorPicker'

export function CategoryCreateForm({
  form,
  error,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  form: CategoryFormState
  error: string | null
  isSubmitting: boolean
  onChange: <K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) => void
  onSubmit: (event: React.FormEvent) => void
}) {
  return (
    <PanelCard>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Nova categoria</h2>
          <p className="text-sm text-muted-foreground">Crie categorias personalizadas para a clínica.</p>
        </div>
      </div>
      <form className="space-y-5" onSubmit={onSubmit}>
        {error && <InlineFeedback>{error}</InlineFeedback>}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Tipo" htmlFor="catType">
            <Select
              value={form.type}
              onValueChange={(value) => onChange('type', value as FinancialTransactionType)}
            >
              <SelectTrigger id="catType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Entrada</SelectItem>
                <SelectItem value="EXPENSE">Saída</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Nome" htmlFor="catName">
            <TextInput
              id="catName"
              value={form.name}
              maxLength={80}
              placeholder="Ex.: Marketing, Equipamentos..."
              onChange={(event) => onChange('name', event.target.value)}
            />
          </FormField>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Identificação visual
          </p>
          <FormField label="Cor" htmlFor="catColor">
            <ColorPicker value={form.color} onChange={(color) => onChange('color', color)} />
          </FormField>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Criar categoria
        </Button>
      </form>
    </PanelCard>
  )
}
