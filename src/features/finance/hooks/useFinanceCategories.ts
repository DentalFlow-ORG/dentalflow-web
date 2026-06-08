import { useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'

import { CATEGORY_COLORS } from '../constants/finance-display'
import {
  createFinancialCategory,
  deleteFinancialCategory,
  updateFinancialCategory,
} from '../services/finance.service'
import type {
  CategoryFormState,
  CreateFinancialCategoryDto,
  FinancialCategory,
} from '../types/finance.types'

const emptyCategoryForm: CategoryFormState = {
  name: '',
  type: 'INCOME',
  color: CATEGORY_COLORS[0],
}

export function useFinanceCategories(reload: () => void) {
  const { showAlert } = useGlobalAlerts()

  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null)
  const [categoryEditForm, setCategoryEditForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [deletingCategory, setDeletingCategory] = useState<FinancialCategory | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [categoryEditError, setCategoryEditError] = useState<string | null>(null)
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const [isUpdatingCategory, setIsUpdatingCategory] = useState(false)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)

  function setCategory<K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) {
    setCategoryForm((prev) => ({ ...prev, [field]: value }))
  }

  function setCategoryEdit<K extends keyof CategoryFormState>(
    field: K,
    value: CategoryFormState[K],
  ) {
    setCategoryEditForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleOpenEditCategory(category: FinancialCategory) {
    setCategoryEditForm({
      name: category.name,
      type: category.type,
      color: category.color ?? CATEGORY_COLORS[0],
    })
    setCategoryEditError(null)
    setEditingCategory(category)
  }

  async function handleCreateCategory(event: React.FormEvent) {
    event.preventDefault()
    setCategoryError(null)

    if (!categoryForm.name.trim()) {
      setCategoryError('O nome da categoria e obrigatorio.')
      return
    }

    setIsSavingCategory(true)
    try {
      const dto: CreateFinancialCategoryDto = {
        name: categoryForm.name.trim(),
        type: categoryForm.type,
        color: categoryForm.color,
      }
      await createFinancialCategory(dto)
      showAlert({
        title: 'Categoria criada',
        description: `"${dto.name}" foi adicionada as categorias.`,
        tone: 'success',
      })
      setCategoryForm(emptyCategoryForm)
      reload()
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : 'Erro ao criar categoria.')
    } finally {
      setIsSavingCategory(false)
    }
  }

  async function handleUpdateCategory(event: React.FormEvent) {
    event.preventDefault()
    if (!editingCategory) return
    setCategoryEditError(null)

    if (!categoryEditForm.name.trim()) {
      setCategoryEditError('O nome da categoria e obrigatorio.')
      return
    }

    setIsUpdatingCategory(true)
    try {
      await updateFinancialCategory(editingCategory.id, {
        name: categoryEditForm.name.trim(),
        type: categoryEditForm.type,
        color: categoryEditForm.color,
      })
      showAlert({
        title: 'Categoria atualizada',
        description: 'As alteracoes foram salvas.',
        tone: 'success',
      })
      setEditingCategory(null)
      reload()
    } catch (err) {
      setCategoryEditError(err instanceof Error ? err.message : 'Erro ao atualizar categoria.')
    } finally {
      setIsUpdatingCategory(false)
    }
  }

  async function handleDeleteCategory() {
    if (!deletingCategory) return
    setIsDeletingCategory(true)
    try {
      await deleteFinancialCategory(deletingCategory.id)
      showAlert({
        title: 'Categoria removida',
        description: `"${deletingCategory.name}" foi removida.`,
        tone: 'success',
      })
      setDeletingCategory(null)
      reload()
    } catch (err) {
      showAlert({
        title: 'Nao foi possivel remover',
        description:
          err instanceof Error
            ? err.message
            : 'Verifique se a categoria possui lancamentos vinculados.',
        tone: 'error',
      })
      setDeletingCategory(null)
    } finally {
      setIsDeletingCategory(false)
    }
  }

  return {
    categoryForm,
    editingCategory,
    setEditingCategory,
    categoryEditForm,
    deletingCategory,
    setDeletingCategory,
    categoryError,
    categoryEditError,
    isSavingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    setCategory,
    setCategoryEdit,
    handleOpenEditCategory,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  }
}
