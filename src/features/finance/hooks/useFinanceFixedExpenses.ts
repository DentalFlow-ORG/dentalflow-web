import { useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { centsToMoneyInput, parseMoneyInputToCents } from '@/lib/money-input'

import {
  FINANCE_REQUIRED_FIELDS_MESSAGE,
  FIXED_EXPENSE_DUE_DAY_MESSAGE,
  FIXED_EXPENSE_END_DATE_MESSAGE,
} from '../constants/finance-form'
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
import {
  hasRequiredFinanceFields,
  isEndDateOnOrAfterStart,
  isValidDueDay,
} from '../utils/finance-form-rules'

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
      amount: centsToMoneyInput(Math.round(Number(expense.amount) * 100)),
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

    if (!hasRequiredFinanceFields(fixedExpenseForm)) {
      setFixedExpenseError(FINANCE_REQUIRED_FIELDS_MESSAGE)
      return
    }
    if (!isValidDueDay(fixedExpenseForm.dueDay)) {
      setFixedExpenseError(FIXED_EXPENSE_DUE_DAY_MESSAGE)
      return
    }

    setIsSavingFixedExpense(true)
    try {
      await createFixedExpense({
        categoryId: fixedExpenseForm.categoryId,
        amount: parseMoneyInputToCents(fixedExpenseForm.amount) / 100,
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

    if (!hasRequiredFinanceFields(fixedExpenseEditForm)) {
      setFixedExpenseEditError(FINANCE_REQUIRED_FIELDS_MESSAGE)
      return
    }
    if (!isValidDueDay(fixedExpenseEditForm.dueDay)) {
      setFixedExpenseEditError(FIXED_EXPENSE_DUE_DAY_MESSAGE)
      return
    }
    if (!isEndDateOnOrAfterStart(fixedExpenseEditForm.startDate, fixedExpenseEditForm.endDate)) {
      setFixedExpenseEditError(FIXED_EXPENSE_END_DATE_MESSAGE)
      return
    }

    setIsUpdatingFixedExpense(true)
    try {
      await updateFixedExpense(editingFixedExpense.id, {
        categoryId: fixedExpenseEditForm.categoryId,
        description: fixedExpenseEditForm.description.trim(),
        amount: parseMoneyInputToCents(fixedExpenseEditForm.amount) / 100,
        recurrence: fixedExpenseEditForm.recurrence,
        dueDay: Number(fixedExpenseEditForm.dueDay),
        startDate: fixedExpenseEditForm.startDate,
        endDate: fixedExpenseEditForm.endDate || null,
      })
      showAlert({
        title: 'Despesa fixa atualizada',
        description: 'As alterações foram salvas com sucesso.',
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
        description: err instanceof Error ? err.message : 'Não foi possível alterar o status.',
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
        title: 'Lançamento gerado',
        description: `${expense.description} foi adicionada ao período atual.`,
        tone: 'success',
      })
      reload()
    } catch (err) {
      showAlert({
        title: 'Erro ao gerar lançamento',
        description: err instanceof Error ? err.message : 'Não foi possível gerar a despesa.',
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
