import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'

import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  centsToMoneyInput,
  formatMoneyInputFromDigits,
  parseMoneyInputToCents,
} from '@/lib/money-input'
import { ApiError } from '@/services/http'

import { createStockProduct, updateStockProduct } from '../services/inventory.service'
import type { StockCategory, StockProduct } from '../types/inventory.types'
import { formatQuantity } from '../utils/inventory-format'

type ProductFormState = {
  name: string
  categoryId: string
  unit: string
  currentQuantity: string
  minQuantity: string
  purchasePrice: string
  supplier: string
  expiresAt: string
  description: string
  notes: string
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  categoryId: '',
  unit: '',
  currentQuantity: '',
  minQuantity: '',
  purchasePrice: '',
  supplier: '',
  expiresAt: '',
  description: '',
  notes: '',
}

function productToForm(product: StockProduct): ProductFormState {
  return {
    name: product.name,
    categoryId: product.categoryId,
    unit: product.unit,
    currentQuantity: String(product.currentQuantity),
    minQuantity: product.minQuantity > 0 ? String(product.minQuantity) : '',
    purchasePrice: centsToMoneyInput(product.purchasePrice),
    supplier: product.supplier ?? '',
    // expiresAt arrives as ISO string ("2025-12-31T00:00:00.000Z") — slice to YYYY-MM-DD
    expiresAt: product.expiresAt ? product.expiresAt.slice(0, 10) : '',
    description: product.description ?? '',
    notes: product.notes ?? '',
  }
}

type ProductFormModalProps = {
  open: boolean
  product: StockProduct | null
  categories: StockCategory[]
  onClose: () => void
  onSuccess: () => void
}

export function ProductFormModal({
  open,
  product,
  categories,
  onClose,
  onSuccess,
}: ProductFormModalProps) {
  const { showAlert } = useGlobalAlerts()
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditMode = product !== null

  const setField = <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Populate or reset form whenever modal opens
  useEffect(() => {
    if (!open) return
    setError(null)
    setForm(product ? productToForm(product) : EMPTY_FORM)
  }, [open, product])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('O nome do produto é obrigatório.')
      return
    }
    if (!form.categoryId) {
      setError('Selecione uma categoria para o produto.')
      return
    }

    const parsedPrice = form.purchasePrice ? parseMoneyInputToCents(form.purchasePrice) : undefined

    const parsedQtyValue = Number.parseFloat(form.currentQuantity)
    const parsedQty =
      !isEditMode && form.currentQuantity !== '' && !Number.isNaN(parsedQtyValue)
        ? parsedQtyValue
        : undefined

    const parsedMinQtyValue = Number.parseFloat(form.minQuantity)
    const parsedMinQty =
      form.minQuantity !== '' && !Number.isNaN(parsedMinQtyValue) ? parsedMinQtyValue : undefined

    const unitValue = form.unit.trim() || 'unidade'

    setIsSaving(true)
    setError(null)

    try {
      if (isEditMode && product) {
        await updateStockProduct(product.id, {
          name: form.name.trim(),
          categoryId: form.categoryId,
          unit: unitValue,
          minQuantity: parsedMinQty,
          purchasePrice: parsedPrice,
          supplier: form.supplier.trim() || undefined,
          expiresAt: form.expiresAt || null,
          description: form.description.trim() || undefined,
          notes: form.notes.trim() || undefined,
        })
        showAlert({ title: 'Produto atualizado com sucesso.', tone: 'success' })
      } else {
        await createStockProduct({
          name: form.name.trim(),
          categoryId: form.categoryId,
          unit: unitValue,
          currentQuantity: parsedQty,
          minQuantity: parsedMinQty,
          purchasePrice: parsedPrice,
          supplier: form.supplier.trim() || undefined,
          expiresAt: form.expiresAt || undefined,
          description: form.description.trim() || undefined,
          notes: form.notes.trim() || undefined,
        })
        showAlert({ title: 'Produto cadastrado com sucesso.', tone: 'success' })
      }

      onSuccess()
      onClose()
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Não foi possível salvar o produto. Tente novamente.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const canSubmit = !isSaving && categories.length > 0

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 focus:outline-none"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          {/* ── Header ── */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-foreground">
                {isEditMode ? 'Editar produto' : 'Novo produto'}
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                {isEditMode
                  ? 'Atualize os dados do produto no estoque.'
                  : 'Preencha os dados para cadastrar um novo produto no estoque.'}
              </Dialog.Description>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Fechar"
              className="shrink-0"
              onClick={onClose}
            >
              <X aria-hidden="true" />
            </Button>
          </div>

          {/* ── Form ── */}
          <form
            id="product-form"
            className="flex flex-1 flex-col overflow-hidden"
            onSubmit={handleSubmit}
          >
            {/* Scrollable body */}
            <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto">
              <div className="space-y-6 px-6 py-5">
                {error && <InlineFeedback>{error}</InlineFeedback>}

                {categories.length === 0 && (
                  <InlineFeedback tone="warning">
                    Nenhuma categoria disponível. Cadastre uma categoria antes de adicionar
                    produtos.
                  </InlineFeedback>
                )}

                {/* ── Identificação ── */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Identificação
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FormField label="Nome do produto" htmlFor="prodName" className="sm:col-span-2">
                      <TextInput
                        id="prodName"
                        value={form.name}
                        maxLength={120}
                        required
                        autoFocus
                        onChange={(e) => setField('name', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Categoria" htmlFor="prodCategory">
                      <Select
                        value={form.categoryId}
                        onValueChange={(v) => setField('categoryId', v)}
                      >
                        <SelectTrigger id="prodCategory">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent position="item-aligned">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Unidade" htmlFor="prodUnit" optional>
                      <TextInput
                        id="prodUnit"
                        value={form.unit}
                        placeholder="Ex.: unidade, caixa, ml"
                        maxLength={40}
                        onChange={(e) => setField('unit', e.target.value)}
                      />
                    </FormField>
                    <FormField
                      label="Fornecedor"
                      htmlFor="prodSupplier"
                      optional
                      className="sm:col-span-2"
                    >
                      <TextInput
                        id="prodSupplier"
                        value={form.supplier}
                        maxLength={120}
                        placeholder="Nome do fornecedor"
                        onChange={(e) => setField('supplier', e.target.value)}
                      />
                    </FormField>
                  </div>
                </div>

                {/* ── Controle de estoque ── */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Controle de estoque
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {isEditMode && product ? (
                      <div className="rounded-lg border border-border bg-muted px-4 py-3">
                        <p className="text-sm font-semibold text-foreground">Quantidade atual</p>
                        <p className="mt-2 text-base font-semibold text-foreground">
                          {formatQuantity(product.currentQuantity, product.unit)}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Para alterar, use a ação "Movimentar estoque".
                        </p>
                      </div>
                    ) : (
                      <FormField label="Quantidade atual" htmlFor="prodQty" optional>
                        <TextInput
                          id="prodQty"
                          type="number"
                          min="0"
                          step="0.001"
                          placeholder="0"
                          value={form.currentQuantity}
                          onChange={(e) => setField('currentQuantity', e.target.value)}
                        />
                      </FormField>
                    )}
                    <FormField label="Quantidade mínima" htmlFor="prodMinQty" optional>
                      <TextInput
                        id="prodMinQty"
                        type="number"
                        min="0"
                        step="0.001"
                        placeholder="0"
                        value={form.minQuantity}
                        onChange={(e) => setField('minQuantity', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Validade" htmlFor="prodExpiry" optional>
                      <DatePickerInput
                        id="prodExpiry"
                        value={form.expiresAt}
                        onValueChange={(v) => setField('expiresAt', v)}
                      />
                    </FormField>
                  </div>
                </div>

                {/* ── Valores ── */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Valores
                  </p>
                  <FormField label="Valor de compra (R$)" htmlFor="prodPrice" optional>
                    <TextInput
                      id="prodPrice"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={form.purchasePrice}
                      onChange={(e) =>
                        setField('purchasePrice', formatMoneyInputFromDigits(e.target.value))
                      }
                    />
                  </FormField>
                </div>

                {/* ── Observações ── */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Observações
                  </p>
                  <div className="space-y-3">
                    <FormField label="Descrição" htmlFor="prodDesc" optional>
                      <TextArea
                        id="prodDesc"
                        value={form.description}
                        maxLength={500}
                        placeholder="Descrição do produto..."
                        onChange={(e) => setField('description', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Observações internas" htmlFor="prodNotes" optional>
                      <TextArea
                        id="prodNotes"
                        value={form.notes}
                        maxLength={2000}
                        placeholder="Observações visíveis apenas para a equipe..."
                        onChange={(e) => setField('notes', e.target.value)}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" form="product-form" disabled={!canSubmit}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isEditMode ? 'Salvar alterações' : 'Cadastrar produto'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
