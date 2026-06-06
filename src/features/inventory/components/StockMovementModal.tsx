import { useEffect, useState } from 'react'
import { Loader2, MoveRight, X } from 'lucide-react'
import { Dialog, VisuallyHidden } from 'radix-ui'

import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ApiError } from '@/services/http'

import { createStockMovement } from '../services/inventory.service'
import type { StockMovementType, StockProduct } from '../types/inventory.types'
import { formatQuantity } from '../utils/inventory-format'

type MovementFormState = {
  type: StockMovementType
  quantity: string
  newQuantity: string
  reason: string
  notes: string
}

const EMPTY_FORM: MovementFormState = {
  type: 'IN',
  quantity: '',
  newQuantity: '',
  reason: '',
  notes: '',
}

const MOVEMENT_TYPE_OPTIONS: Array<{
  value: StockMovementType
  label: string
  description: string
}> = [
  { value: 'IN', label: 'Entrada', description: 'Aumenta a quantidade em estoque' },
  { value: 'OUT', label: 'Saída', description: 'Baixa por uso ou retirada' },
  {
    value: 'ADJUSTMENT',
    label: 'Ajuste',
    description: 'Define a quantidade final',
  },
  { value: 'LOSS', label: 'Perda/descarte', description: 'Baixa por perda ou descarte' },
]

type StockMovementModalProps = {
  product: StockProduct | null
  onClose: () => void
  onSuccess: () => void
}

export function StockMovementModal({
  product,
  onClose,
  onSuccess,
}: StockMovementModalProps) {
  const { showAlert } = useGlobalAlerts()
  const [form, setForm] = useState<MovementFormState>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOpen = product !== null
  const isAdjustment = form.type === 'ADJUSTMENT'

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY_FORM)
      setError(null)
    }
  }, [isOpen])

  const handleTypeChange = (type: StockMovementType) => {
    setForm((current) => ({
      ...current,
      type,
      quantity: type === 'ADJUSTMENT' ? '' : current.quantity,
      newQuantity: type === 'ADJUSTMENT' ? current.newQuantity : '',
    }))
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!product) return

    const parsedQuantity = parsePositiveNumber(form.quantity)
    const parsedNewQuantity = parseNonNegativeNumber(form.newQuantity)

    if (isAdjustment) {
      if (parsedNewQuantity === null) {
        setError('Informe a quantidade final do ajuste.')
        return
      }
    } else if (parsedQuantity === null || parsedQuantity <= 0) {
      setError('Informe uma quantidade maior que zero.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await createStockMovement({
        productId: product.id,
        type: form.type,
        ...(isAdjustment
          ? { newQuantity: parsedNewQuantity ?? 0 }
          : { quantity: parsedQuantity ?? 0 }),
        reason: form.reason.trim() || undefined,
        notes: form.notes.trim() || undefined,
      })

      showAlert({ title: 'Movimentação registrada com sucesso.', tone: 'success' })
      onSuccess()
      onClose()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível registrar a movimentação. Tente novamente.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[61] flex max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 focus:outline-none"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Movimentar estoque</Dialog.Title>
          </VisuallyHidden.Root>
          <Dialog.Description className="sr-only">
            Registre uma entrada, saída, ajuste ou perda para manter o estoque atualizado.
          </Dialog.Description>

          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border/50 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">
                Movimentar estoque
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Registre uma entrada, saída, ajuste ou perda para manter o estoque atualizado.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Fechar movimentação de estoque"
              className="shrink-0"
            >
              <X aria-hidden="true" />
            </Button>
          </div>

          <form className="flex flex-1 flex-col overflow-hidden" onSubmit={handleSubmit}>
            <div className="app-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {error && (
                  <div className="sm:col-span-2">
                    <InlineFeedback>{error}</InlineFeedback>
                  </div>
                )}

                {product && (
                  <div className="sm:col-span-2 rounded-lg border border-border bg-muted px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Produto
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{product.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Estoque atual: {formatQuantity(product.currentQuantity, product.unit)}
                    </p>
                  </div>
                )}

                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-semibold text-foreground">
                    Tipo de movimentação
                  </legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {MOVEMENT_TYPE_OPTIONS.map((option) => {
                      const isSelected = form.type === option.value

                      return (
                        <label key={option.value} className="block cursor-pointer">
                          <input
                            type="radio"
                            name="stockMovementType"
                            value={option.value}
                            checked={isSelected}
                            onChange={() => handleTypeChange(option.value)}
                            className="peer sr-only"
                          />
                          <span
                            className={cn(
                              'flex min-h-20 flex-col justify-between rounded-lg border bg-card px-3 py-3 text-left shadow-sm transition',
                              'peer-focus-visible:outline-none peer-focus-visible:ring-3 peer-focus-visible:ring-primary/15',
                              isSelected
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border text-foreground hover:border-primary/35 hover:bg-primary/5',
                            )}
                          >
                            <span className="flex items-start justify-between gap-3">
                              <span className="text-sm font-semibold">{option.label}</span>
                              {isSelected && (
                                <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                                  Selecionado
                                </span>
                              )}
                            </span>
                            <span
                              className={cn(
                                'mt-2 text-xs leading-5',
                                isSelected ? 'text-primary/80' : 'text-muted-foreground',
                              )}
                            >
                              {option.description}
                            </span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                {isAdjustment ? (
                  <FormField label="Quantidade final" htmlFor="stockMovementNewQuantity">
                    <TextInput
                      id="stockMovementNewQuantity"
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      placeholder="0"
                      value={form.newQuantity}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, newQuantity: event.target.value }))
                      }
                    />
                  </FormField>
                ) : (
                  <FormField label="Quantidade" htmlFor="stockMovementQuantity">
                    <TextInput
                      id="stockMovementQuantity"
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      placeholder="0"
                      value={form.quantity}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, quantity: event.target.value }))
                      }
                    />
                  </FormField>
                )}

                <FormField
                  label="Motivo"
                  htmlFor="stockMovementReason"
                  optional
                  className="sm:col-span-2"
                >
                  <TextInput
                    id="stockMovementReason"
                    value={form.reason}
                    maxLength={120}
                    placeholder="Ex.: Reposição, uso clínico, contagem física..."
                    onChange={(event) =>
                      setForm((current) => ({ ...current, reason: event.target.value }))
                    }
                  />
                </FormField>

                <FormField
                  label="Observações"
                  htmlFor="stockMovementNotes"
                  optional
                  className="sm:col-span-2"
                >
                  <TextArea
                    id="stockMovementNotes"
                    value={form.notes}
                    maxLength={2000}
                    placeholder="Detalhes internos da movimentação..."
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value }))
                    }
                  />
                </FormField>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-border/50 px-5 py-4 sm:flex-row sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <MoveRight className="h-4 w-4" aria-hidden="true" />
                )}
                Registrar movimentação
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function parsePositiveNumber(value: string) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function parseNonNegativeNumber(value: string) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}
