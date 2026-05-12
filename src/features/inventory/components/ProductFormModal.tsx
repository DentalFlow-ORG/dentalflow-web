import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { DatePickerInput } from '@/components/common/DatePickerInput'
import { FormField, TextArea, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError } from '@/services/http'

import type { StockCategory, StockProduct } from '../types/inventory.types'
import { createStockProduct, updateStockProduct } from '../services/inventory.service'

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
  unit: 'unidade',
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
    purchasePrice:
      product.purchasePrice !== null ? (product.purchasePrice / 100).toFixed(2) : '',
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

    const rawPrice = form.purchasePrice.trim().replace(',', '.')
    const parsedPriceValue = parseFloat(rawPrice)
    const parsedPrice =
      rawPrice !== '' && !isNaN(parsedPriceValue)
        ? Math.round(parsedPriceValue * 100)
        : undefined

    const parsedQtyValue = parseFloat(form.currentQuantity)
    const parsedQty =
      form.currentQuantity !== '' && !isNaN(parsedQtyValue) ? parsedQtyValue : undefined

    const parsedMinQtyValue = parseFloat(form.minQuantity)
    const parsedMinQty =
      form.minQuantity !== '' && !isNaN(parsedMinQtyValue) ? parsedMinQtyValue : undefined

    const unitValue = form.unit.trim() || 'unidade'

    setIsSaving(true)
    setError(null)

    try {
      if (isEditMode && product) {
        await updateStockProduct(product.id, {
          name: form.name.trim(),
          categoryId: form.categoryId,
          unit: unitValue,
          currentQuantity: parsedQty,
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
          aria-labelledby="product-form-title"
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 focus:outline-none"
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
        >
          {/* ── Header ── */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
            <Dialog.Title
              id="product-form-title"
              className="text-base font-semibold text-slate-950"
            >
              {isEditMode ? 'Editar produto' : 'Novo produto'}
            </Dialog.Title>
            <button
              type="button"
              aria-label="Fechar"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* ── Form ── */}
          <form className="flex flex-1 flex-col overflow-hidden" onSubmit={handleSubmit}>
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {error && (
                  <div className="sm:col-span-2">
                    <InlineFeedback>{error}</InlineFeedback>
                  </div>
                )}

                {categories.length === 0 && (
                  <div className="sm:col-span-2">
                    <InlineFeedback tone="warning">
                      Nenhuma categoria disponível. Cadastre uma categoria antes de adicionar produtos.
                    </InlineFeedback>
                  </div>
                )}

                {/* Nome do produto */}
                <FormField
                  label="Nome do produto"
                  htmlFor="prodName"
                  className="sm:col-span-2"
                >
                  <TextInput
                    id="prodName"
                    value={form.name}
                    maxLength={120}
                    required
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    onChange={(e) => setField('name', e.target.value)}
                  />
                </FormField>

                {/* Categoria */}
                <FormField label="Categoria" htmlFor="prodCategory">
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => setField('categoryId', v)}
                  >
                    <SelectTrigger id="prodCategory">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                {/* Unidade */}
                <FormField label="Unidade" htmlFor="prodUnit" optional>
                  <TextInput
                    id="prodUnit"
                    value={form.unit}
                    placeholder="Ex.: unidade, caixa, ml"
                    maxLength={40}
                    onChange={(e) => setField('unit', e.target.value)}
                  />
                </FormField>

                {/* Quantidade atual */}
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

                {/* Quantidade mínima */}
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

                {/* Valor de compra */}
                <FormField label="Valor de compra (R$)" htmlFor="prodPrice" optional>
                  <TextInput
                    id="prodPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={form.purchasePrice}
                    onChange={(e) => setField('purchasePrice', e.target.value)}
                  />
                </FormField>

                {/* Validade */}
                <FormField label="Validade" htmlFor="prodExpiry" optional>
                  <DatePickerInput
                    id="prodExpiry"
                    value={form.expiresAt}
                    onValueChange={(v) => setField('expiresAt', v)}
                  />
                </FormField>

                {/* Fornecedor */}
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

                {/* Descrição */}
                <FormField
                  label="Descrição"
                  htmlFor="prodDesc"
                  optional
                  className="sm:col-span-2"
                >
                  <TextArea
                    id="prodDesc"
                    value={form.description}
                    maxLength={500}
                    placeholder="Descrição do produto..."
                    onChange={(e) => setField('description', e.target.value)}
                  />
                </FormField>

                {/* Observações internas */}
                <FormField
                  label="Observações internas"
                  htmlFor="prodNotes"
                  optional
                  className="sm:col-span-2"
                >
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

            {/* ── Footer ── */}
            <div className="flex shrink-0 gap-3 border-t border-slate-100 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={!canSubmit}>
                {isSaving && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                {isEditMode ? 'Salvar alterações' : 'Cadastrar produto'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
