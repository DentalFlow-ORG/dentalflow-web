import { Loader2, Pencil, Plus, Tag, Trash2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { ActionIconButton } from '@/components/common/ActionIconButton'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormField, TextInput } from '@/components/common/FormField'
import { InlineFeedback } from '@/components/common/InlineFeedback'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ApiError } from '@/services/http'

import {
  createStockCategory,
  deleteStockCategory,
  updateStockCategory,
} from '../services/inventory.service'
import type { StockCategory } from '../types/inventory.types'

const CATEGORY_NAME_MAX_LENGTH = 80

const CATEGORY_COLORS = ['#1E3A8A', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#0EA5E9'] as const

const CATEGORY_COLOR_LABELS: Record<(typeof CATEGORY_COLORS)[number], string> = {
  '#1E3A8A': 'Azul',
  '#10B981': 'Verde',
  '#6366F1': 'Índigo',
  '#F59E0B': 'Âmbar',
  '#EF4444': 'Vermelho',
  '#0EA5E9': 'Ciano',
}

type CategoryFormState = {
  name: string
  color: string
}

type CategoryManagerModalProps = {
  open: boolean
  categories: StockCategory[]
  onClose: () => void
  onCategoriesChanged: (options?: { refreshProducts?: boolean }) => void
}

const EMPTY_FORM: CategoryFormState = {
  name: '',
  color: '',
}

function categoryToForm(category: StockCategory): CategoryFormState {
  return {
    name: category.name,
    color: category.color ?? '',
  }
}

export function CategoryManagerModal({
  open,
  categories,
  onClose,
  onCategoriesChanged,
}: CategoryManagerModalProps) {
  const { showAlert } = useGlobalAlerts()
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM)
  const [editingCategory, setEditingCategory] = useState<StockCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<StockCategory | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [invalidField, setInvalidField] = useState<'name' | 'color' | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isEditMode = editingCategory !== null

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      setEditingCategory(null)
      setDeletingCategory(null)
      setFormError(null)
      setDeleteError(null)
    }
  }, [open])

  const handleEdit = (category: StockCategory) => {
    setForm(categoryToForm(category))
    setEditingCategory(category)
    setFormError(null)
  }

  const handleCancelEdit = () => {
    setForm(EMPTY_FORM)
    setEditingCategory(null)
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setInvalidField(null)

    const name = form.name.trim()
    const color = form.color.trim()

    if (!name) {
      setInvalidField('name')
      setFormError('O nome da categoria é obrigatório.')
      return
    }

    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setInvalidField('color')
      setFormError('Cor inválida. Use o formato #RRGGBB ou selecione uma cor sugerida.')
      return
    }

    setIsSaving(true)
    setFormError(null)

    try {
      if (editingCategory) {
        // An emptied color is sent as null so the API really clears it.
        await updateStockCategory(editingCategory.id, { name, color: color || null })
        showAlert({ title: 'Categoria atualizada com sucesso.', tone: 'success' })
        onCategoriesChanged({ refreshProducts: true })
      } else {
        await createStockCategory({ name, color: color || undefined })
        showAlert({ title: 'Categoria cadastrada com sucesso.', tone: 'success' })
        onCategoriesChanged()
      }

      setForm(EMPTY_FORM)
      setEditingCategory(null)
    } catch (err) {
      const fallback = editingCategory
        ? 'Não foi possível atualizar a categoria.'
        : 'Não foi possível cadastrar a categoria.'
      setFormError(err instanceof ApiError && err.message ? err.message : fallback)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteRequest = (category: StockCategory) => {
    setDeletingCategory(category)
    setDeleteError(null)
  }

  const handleDeleteCancel = () => {
    setDeletingCategory(null)
    setDeleteError(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteStockCategory(deletingCategory.id)
      showAlert({ title: 'Categoria excluída com sucesso.', tone: 'success' })
      setDeletingCategory(null)
      onCategoriesChanged()

      if (editingCategory?.id === deletingCategory.id) {
        handleCancelEdit()
      }
    } catch (err) {
      setDeleteError(getDeleteErrorMessage(err))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 focus:outline-none">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div className="min-w-0">
                <Dialog.Title className="text-base font-semibold text-foreground">
                  Gerenciar categorias
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                  Crie, edite e exclua categorias usadas nos produtos do estoque.
                </Dialog.Description>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Fechar gerenciamento de categorias"
                className="shrink-0"
              >
                <X aria-hidden="true" />
              </Button>
            </div>

            <div className="app-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <form noValidate className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {isEditMode ? 'Editar categoria' : 'Nova categoria'}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      O nome é obrigatório. A cor ajuda na identificação visual.
                    </p>
                  </div>

                  {formError && !invalidField && <InlineFeedback>{formError}</InlineFeedback>}

                  <FormField
                    label="Nome da categoria"
                    htmlFor="stockCategoryName"
                    error={invalidField === 'name' ? formError : undefined}
                  >
                    <TextInput
                      id="stockCategoryName"
                      aria-invalid={Boolean(formError) && invalidField === 'name'}
                      aria-describedby={
                        formError && invalidField === 'name' ? 'stockCategoryName-error' : undefined
                      }
                      value={form.name}
                      maxLength={CATEGORY_NAME_MAX_LENGTH}
                      required
                      placeholder="Ex.: Materiais descartáveis"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                  </FormField>

                  <FormField
                    label="Cor"
                    htmlFor="stockCategoryColor"
                    optional
                    error={invalidField === 'color' ? formError : undefined}
                  >
                    <TextInput
                      id="stockCategoryColor"
                      aria-invalid={Boolean(formError) && invalidField === 'color'}
                      aria-describedby={
                        formError && invalidField === 'color'
                          ? 'stockCategoryColor-error'
                          : undefined
                      }
                      value={form.color}
                      maxLength={20}
                      placeholder="#1E3A8A"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, color: event.target.value }))
                      }
                    />
                    <div className="mt-2 flex flex-wrap gap-2" aria-label="Cores sugeridas">
                      {CATEGORY_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          title={CATEGORY_COLOR_LABELS[color]}
                          aria-label={`Selecionar cor ${CATEGORY_COLOR_LABELS[color]}`}
                          aria-pressed={form.color === color}
                          className={cn(
                            'h-8 w-8 rounded-full border-2 transition focus:outline-none focus:ring-3 focus:ring-primary/15',
                            form.color === color
                              ? 'border-foreground'
                              : 'border-card ring-1 ring-border',
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setForm((current) => ({ ...current, color }))}
                        />
                      ))}
                    </div>
                  </FormField>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">
                    {isEditMode && (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                      >
                        Cancelar edição
                      </Button>
                    )}
                    <Button type="submit" className="flex-1" disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : isEditMode ? (
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      )}
                      {isEditMode ? 'Salvar alterações' : 'Cadastrar categoria'}
                    </Button>
                  </div>
                </form>

                <section aria-labelledby="stock-category-list-title" className="min-w-0">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3
                        id="stock-category-list-title"
                        className="text-sm font-semibold text-foreground"
                      >
                        Categorias cadastradas
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {categories.length} categoria{categories.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Tag className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>

                  <div className="app-scrollbar max-h-[42vh] space-y-2 overflow-y-auto pr-1">
                    {categories.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                        Nenhuma categoria cadastrada.
                      </p>
                    ) : (
                      categories.map((category) => (
                        <article
                          key={category.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-3 py-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full border border-border bg-muted"
                              style={
                                category.color ? { backgroundColor: category.color } : undefined
                              }
                              aria-hidden="true"
                            />
                            <div className="min-w-0">
                              <h4 className="truncate text-sm font-semibold text-foreground">
                                {category.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {category.productCount} produto
                                {category.productCount !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              type="button"
                              title="Editar categoria"
                              aria-label={`Editar categoria ${category.name}`}
                              onClick={() => handleEdit(category)}
                              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus:outline-none focus:ring-3 focus:ring-primary/15"
                            >
                              <Pencil className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <ActionIconButton
                              tone="danger"
                              title="Excluir categoria"
                              aria-label={`Excluir categoria ${category.name}`}
                              onClick={() => handleDeleteRequest(category)}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </ActionIconButton>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <ConfirmDialog
        open={deletingCategory !== null}
        title="Excluir categoria"
        subject={deletingCategory?.name}
        description="Tem certeza que deseja excluir esta categoria? Categorias com produtos vinculados não podem ser excluídas."
        confirmLabel="Excluir categoria"
        isConfirming={isDeleting}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      >
        {deleteError && <InlineFeedback tone="error">{deleteError}</InlineFeedback>}
      </ConfirmDialog>
    </>
  )
}

function getDeleteErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 409) {
      return 'Não é possível excluir uma categoria com produtos vinculados.'
    }

    return error.message || 'Não foi possível excluir a categoria.'
  }

  return 'Não foi possível excluir a categoria.'
}
