import { useState } from 'react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { brazilTodayIso } from '@/lib/brazil-timezone'
import { centsToMoneyInput, parseMoneyInputToCents } from '@/lib/money-input'

import {
  createFinancialTransaction,
  deleteFinancialTransaction,
  updateFinancialTransaction,
} from '../services/finance.service'
import type {
  FinancialCategory,
  FinancialTransaction,
  TransactionFormState,
} from '../types/finance.types'

const emptyTransactionForm: TransactionFormState = {
  type: 'INCOME',
  categoryId: '',
  amount: '',
  description: '',
  transactionDate: brazilTodayIso(),
  dueDate: '',
  status: 'PAID',
}

export function useFinanceTransactions(
  reload: () => void,
  incomeCategories: FinancialCategory[],
  expenseCategories: FinancialCategory[],
) {
  const { showAlert } = useGlobalAlerts()

  const [transactionForm, setTransactionForm] = useState<TransactionFormState>(emptyTransactionForm)
  const [transactionError, setTransactionError] = useState<string | null>(null)
  const [isSavingTransaction, setIsSavingTransaction] = useState(false)

  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<FinancialTransaction | null>(null)
  const [editForm, setEditForm] = useState<TransactionFormState>(emptyTransactionForm)
  const [editError, setEditError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const transactionCategories =
    transactionForm.type === 'INCOME' ? incomeCategories : expenseCategories

  function setTransaction<K extends keyof TransactionFormState>(
    field: K,
    value: TransactionFormState[K],
  ) {
    setTransactionForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'type') next.categoryId = ''
      return next
    })
  }

  async function handleCreateTransaction(event: React.FormEvent) {
    event.preventDefault()
    setTransactionError(null)

    if (!transactionForm.categoryId || !transactionForm.amount || !transactionForm.description) {
      setTransactionError('Categoria, valor e descricao sao obrigatorios.')
      return
    }

    setIsSavingTransaction(true)
    try {
      await createFinancialTransaction({
        type: transactionForm.type,
        categoryId: transactionForm.categoryId,
        amount: parseMoneyInputToCents(transactionForm.amount) / 100,
        description: transactionForm.description.trim(),
        transactionDate: transactionForm.transactionDate,
        dueDate: transactionForm.dueDate || undefined,
        status: transactionForm.status,
      })
      showAlert({
        title: 'Movimentacao criada',
        description: 'O lancamento foi registrado no financeiro.',
        tone: 'success',
      })
      setTransactionForm(emptyTransactionForm)
      reload()
    } catch (err) {
      setTransactionError(err instanceof Error ? err.message : 'Erro ao salvar movimentacao.')
    } finally {
      setIsSavingTransaction(false)
    }
  }

  function handleOpenEdit(transaction: FinancialTransaction) {
    setEditForm({
      type: transaction.type,
      categoryId: transaction.categoryId,
      amount: centsToMoneyInput(Math.round(Number(transaction.amount) * 100)),
      description: transaction.description,
      transactionDate: transaction.transactionDate.slice(0, 10),
      dueDate: transaction.dueDate?.slice(0, 10) ?? '',
      status: transaction.status,
    })
    setEditError(null)
    setEditingTransaction(transaction)
  }

  function setEditField<K extends keyof TransactionFormState>(
    field: K,
    value: TransactionFormState[K],
  ) {
    setEditForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'type') next.categoryId = ''
      return next
    })
  }

  async function handleUpdateTransaction(event: React.FormEvent) {
    event.preventDefault()
    if (!editingTransaction) return
    setEditError(null)

    if (!editForm.categoryId || !editForm.amount || !editForm.description) {
      setEditError('Categoria, valor e descricao sao obrigatorios.')
      return
    }

    setIsUpdating(true)
    try {
      await updateFinancialTransaction(editingTransaction.id, {
        type: editForm.type,
        categoryId: editForm.categoryId,
        amount: parseMoneyInputToCents(editForm.amount) / 100,
        description: editForm.description.trim(),
        transactionDate: editForm.transactionDate,
        dueDate: editForm.dueDate || null,
        status: editForm.status,
      })
      showAlert({
        title: 'Movimentacao atualizada',
        description: 'O lancamento foi atualizado com sucesso.',
        tone: 'success',
      })
      setEditingTransaction(null)
      reload()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erro ao atualizar movimentacao.')
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDeleteTransaction() {
    if (!deletingTransaction) return
    setIsDeleting(true)
    try {
      await deleteFinancialTransaction(deletingTransaction.id)
      showAlert({
        title: 'Lancamento cancelado',
        description: `"${deletingTransaction.description}" foi cancelado.`,
        tone: 'success',
      })
      setDeletingTransaction(null)
      reload()
    } catch (err) {
      showAlert({
        title: 'Erro ao cancelar lancamento',
        description: err instanceof Error ? err.message : 'Nao foi possivel cancelar.',
        tone: 'error',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    transactionForm,
    transactionError,
    isSavingTransaction,
    editingTransaction,
    setEditingTransaction,
    deletingTransaction,
    setDeletingTransaction,
    editForm,
    editError,
    isUpdating,
    isDeleting,
    transactionCategories,
    setTransaction,
    handleCreateTransaction,
    handleOpenEdit,
    setEditField,
    handleUpdateTransaction,
    handleDeleteTransaction,
  }
}
