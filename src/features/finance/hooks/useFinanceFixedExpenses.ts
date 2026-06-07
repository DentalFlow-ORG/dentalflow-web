import { useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { brazilTodayIso } from '@/lib/brazil-timezone'

import {
  createFixedExpense,
  generateFixedExpenseOccurrence,
  updateFixedExpense,
} from '../services/finance.service'
import type {
  FinanceFilters,
  FixedExpense,
  FixedExpenseEditFormState,
  FixedExpenseFormState,
} from '../types/finance.types'

const emptyFixedExpenseForm: FixedExpenseFormState = {
  categoryId: '',
  description: '',
  amount: '',
  recurrence: 'MONTHLY',
  dueDay: brazilTodayIso().split('-')[2].replace(/^0/, ''),
  startDate: brazilTodayIso(),
}

export function useFinanceFixedExpenses(reload: () => void, filters: FinanceFilters) {
  const { showAlert } = useGlobalAlerts()

  const [fixedExpenseForm, setFixedExpenseForm] =
    useState<FixedExpenseFormState>(emptyFixedExpenseForm)
  const [fixedExpenseError, setFixedExpenseError] = useState<string | null>(null)
  const [isSavingFixedExpense, setIsSavingFixedExpense] = useState(false)
  const [generatingExpenseId, setGeneratingExpenseId] = useState<string | null>(null)

  const [editingFixedExpense, setEditingFixedExpense] = useState<FixedExpense | null>(null)
  const [togglingFixedExpense, setTogglingFixedExpense] = useState<FixedExpense | null>(null)
  const [fixedExpenseEditForm, setFixedExpenseEditForm] = useState<FixedExpenseEditFormState>({
    categoryId: '',
    description: '',
    amount: '',
    recurrence: 'MONTHLY',
    dueDay: '1',
    startDate: '',
    endDate: '',
  })
  const [fixedExpenseEditError, setFixedExpenseEditError] = useState<string | null>(null)
  const [isUpdatingFixedExpense, setIsUpdatingFixedExpense] = useState(false)
  const [isTogglingFixedExpense, setIsTogglingFixedExpense] = useState(false)

  function setFixedExpense<K extends keyof FixedExpenseFormState>(
    field: K,
    value: FixedExpenseFormState[K],
  ) {
    setFixedExpenseForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleOpenEditFixedExpense(expense: FixedExpense) {
    setFixedExpenseEditForm({
      categoryId: expense.categoryId,
      description: expense.description,
      amount: String(expense.amount),
      recurrence: expense.recurrence,
      dueDay: String(expense.dueDay),
      startDate: expense.startDate.slice(0, 10),
      endDate: expense.endDate?.slice(0, 10) ?? '',
    })
    setFixedExpenseEditError(null)
    setEditingFixedExpense(expense)
  }

  function setFixedExpenseEditField<K extends keyof FixedExpenseEditFormState>(
    field: K,
    value: FixedExpenseEditFormState[K],
  ) {
    setFixedExpenseEditForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCreateFixedExpense(event: React.FormEvent) {
    event.preventDefault()
    setFixedExpenseError(null)

    if (
      !fixedExpenseForm.categoryId ||
      !fixedExpenseForm.amount ||
      !fixedExpenseForm.description
    ) {
      setFixedExpenseError('Categoria, valor e descricao sao obrigatorios.')
      return
    }

    setIsSavingFixedExpense(true)
    try {
      await createFixedExpense({
        categoryId: fixedExpenseForm.categoryId,
        amount: Number(fixedExpenseForm.amount),
        description: fixedExpenseForm.description.trim(),
        recurrence: fixedExpenseForm.recurrence,
        dueDay: Number(fixedExpenseForm.dueDay),
        startDate: fixedExpenseForm.startDate,
        isActive: true,
      })
      showAlert({
        title: 'Despesa fixa criada',
        description: 'A despesa recorrente foi cadastrada.',
        tone: 'success',
      })
      setFixedExpenseForm(emptyFixedExpenseForm)
      reload()
    } catch (err) {
      setFixedExpenseError(err instanceof Error ? err.message : 'Erro ao salvar despesa fixa.')
    } finally {
      setIsSavingFixedExpense(false)
    }
  }

  async function handleUpdateFixedExpense(event: React.FormEvent) {
    event.preventDefault()
    if (!editingFixedExpense) return
    setFixedExpenseEditError(null)

    if (
      !fixedExpenseEditForm.categoryId ||
      !fixedExpenseEditForm.amount ||
      !fixedExpenseEditForm.description
    ) {
      setFixedExpenseEditError('Categoria, valor e descricao sao obrigatorios.')
      return
    }

    setIsUpdatingFixedExpense(true)
    try {
      await updateFixedExpense(editingFixedExpense.id, {
        categoryId: fixedExpenseEditForm.categoryId,
        description: fixedExpenseEditForm.description.trim(),
        amount: Number(fixedExpenseEditForm.amount),
        recurrence: fixedExpenseEditForm.recurrence,
        dueDay: Number(fixedExpenseEditForm.dueDay),
        startDate: fixedExpenseEditForm.startDate,
        endDate: fixedExpenseEditForm.endDate || null,
      })
      showAlert({
        title: 'Despesa fixa atualizada',
        description: 'As alteracoes foram salvas com sucesso.',
        tone: 'success',
      })
      setEditingFixedExpense(null)
      reload()
    } catch (err) {
      setFixedExpenseEditError(
        err instanceof Error ? err.message : 'Erro ao atualizar despesa fixa.',
      )
    } finally {
      setIsUpdatingFixedExpense(false)
    }
  }

  async function handleToggleFixedExpense() {
    if (!togglingFixedExpense) return
    setIsTogglingFixedExpense(true)
    const nextActive = !togglingFixedExpense.isActive
    try {
      await updateFixedExpense(togglingFixedExpense.id, { isActive: nextActive })
      showAlert({
        title: nextActive ? 'Despesa fixa ativada' : 'Despesa fixa desativada',
        description: `"${togglingFixedExpense.description}" foi ${nextActive ? 'ativada' : 'desativada'}.`,
        tone: 'success',
      })
      setTogglingFixedExpense(null)
      reload()
    } catch (err) {
      showAlert({
        title: 'Erro ao alterar status',
        description: err instanceof Error ? err.message : 'Nao foi possivel alterar o status.',
        tone: 'error',
      })
    } finally {
      setIsTogglingFixedExpense(false)
    }
  }

  async function handleGenerateFixedExpense(expense: FixedExpense) {
    setGeneratingExpenseId(expense.id)
    try {
      await generateFixedExpenseOccurrence(expense.id, filters.from.slice(0, 7))
      showAlert({
        title: 'Lancamento gerado',
        description: `${expense.description} foi adicionada ao periodo atual.`,
        tone: 'success',
      })
      reload()
    } catch (err) {
      showAlert({
        title: 'Erro ao gerar lancamento',
        description: err instanceof Error ? err.message : 'Nao foi possivel gerar a despesa.',
        tone: 'error',
      })
    } finally {
      setGeneratingExpenseId(null)
    }
  }

  return {
    fixedExpenseForm,
    fixedExpenseError,
    isSavingFixedExpense,
    generatingExpenseId,
    editingFixedExpense,
    setEditingFixedExpense,
    togglingFixedExpense,
    setTogglingFixedExpense,
    fixedExpenseEditForm,
    fixedExpenseEditError,
    isUpdatingFixedExpense,
    isTogglingFixedExpense,
    setFixedExpense,
    handleCreateFixedExpense,
    handleOpenEditFixedExpense,
    setFixedExpenseEditField,
    handleUpdateFixedExpense,
    handleToggleFixedExpense,
    handleGenerateFixedExpense,
  }
}
