import { Loader2, Pencil, Plus, Tag, Trash2, X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import { ActionIconButton } from '@/components/common/ActionIconButton'
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

    const name = form.name.trim()
    const color = form.color.trim()

    if (!name) {
      setFormError('O nome da categoria é obrigatório.')
      return
    }

    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setFormError('Cor inválida. Use o formato #RRGGBB ou selecione uma cor sugerida.')
      return
    }

    setIsSaving(true)
    setFormError(null)

    try {
      const payload = {
        name,
        color: color || undefined,
      }

      if (editingCategory) {
        await updateStockCategory(editingCategory.id, payload)
        showAlert({ title: 'Categoria atualizada com sucesso.', tone: 'success' })
        onCategoriesChanged({ refreshProducts: true })
      } else {
        await createStockCategory(payload)
        showAlert({ title: 'Categoria cadastrada com sucesso.', tone: 'success' })
        onCategoriesChanged()
      }

      setForm(EMPTY_FORM)
      setEditingCategory(null)
    } catch {
      setFormError(
        editingCategory
          ? 'Não foi possível atualizar a categoria.'
          : 'Não foi possível cadastrar a categoria.',
      )
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
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 focus:outline-none"
            onEscapeKeyDown={onClose}
            onInteractOutside={onClose}
          >
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
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {isEditMode ? 'Editar categoria' : 'Nova categoria'}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      O nome é obrigatório. A cor ajuda na identificação visual.
                    </p>
                  </div>

                  {formError && <InlineFeedback>{formError}</InlineFeedback>}

                  <FormField label="Nome da categoria" htmlFor="stockCategoryName">
                    <TextInput
                      id="stockCategoryName"
                      value={form.name}
                      maxLength={CATEGORY_NAME_MAX_LENGTH}
                      required
                      placeholder="Ex.: Materiais descartáveis"
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                  </FormField>

                  <FormField label="Cor" htmlFor="stockCategoryColor" optional>
                    <TextInput
                      id="stockCategoryColor"
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

      <DeleteCategoryDialog
        category={deletingCategory}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}

function DeleteCategoryDialog({
  category,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: {
  category: StockCategory | null
  isDeleting: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog.Root open={category !== null} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/15 animate-in fade-in-0 zoom-in-[0.97] duration-150 focus:outline-none"
          onEscapeKeyDown={onCancel}
          onInteractOutside={onCancel}
        >
          <div className="px-8 pb-6 pt-8">
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50"
              aria-hidden="true"
            >
              <Trash2 className="h-7 w-7 text-red-600" aria-hidden="true" />
            </div>

            <Dialog.Title className="text-center text-xl font-bold text-foreground">
              Excluir categoria
            </Dialog.Title>

            <Dialog.Description className="mt-2 text-center text-sm leading-6 text-muted-foreground">
              Tem certeza que deseja excluir esta categoria? Categorias com produtos vinculados não
              podem ser excluídas.
            </Dialog.Description>

            {category && (
              <p className="mx-auto mt-3 w-fit rounded-md bg-red-50 px-3 py-1 text-sm font-semibold text-red-800">
                {category.name}
              </p>
            )}

            {error && (
              <div className="mt-4">
                <InlineFeedback tone="error">{error}</InlineFeedback>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-red-100 bg-red-50/60 px-8 py-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isDeleting ? 'Excluindo...' : 'Excluir categoria'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
