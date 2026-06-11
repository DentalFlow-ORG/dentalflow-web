import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// Stub ExpenseClassifyAction — keeps tests focused on the table layout
vi.mock('@/features/finance/components/ExpenseClassifyAction', () => ({
  ExpenseClassifyAction: ({ transactionId }: { transactionId: string }) => (
    <div data-testid={`classify-${transactionId}`}>classify-action</div>
  ),
}))

// Stub Pagination — avoids Radix Select dependency; preserves callback testing
vi.mock('@/components/common/Pagination', () => ({
  Pagination: ({
    page,
    onPageChange,
  }: {
    page: number
    onPageChange: (p: number) => void
  }) => (
    <div data-testid="pagination">
      <button type="button" onClick={() => onPageChange(page + 1)}>
        Próxima página
      </button>
    </div>
  ),
}))

import { TransactionsTable } from '@/features/finance/components/TransactionsTable'
import type { ClassifierState } from '@/features/finance/hooks/useExpenseClassifier'
import type { FinancialTransaction } from '@/features/finance/types/finance.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const defaultClassifierState: ClassifierState = {
  result: null,
  isClassifying: false,
  isApplying: false,
  isPlanBlocked: false,
  isQuotaExceeded: false,
  error: null,
}

const incomeTransaction: FinancialTransaction = {
  id: 'tx-income',
  clinicId: 'clinic-1',
  type: 'INCOME',
  source: 'SERVICE_PAYMENT',
  categoryId: 'cat-1',
  amount: 35000,
  description: 'Consulta ortopédica',
  transactionDate: '2026-06-10',
  status: 'PAID',
  createdByUserId: 'user-1',
  createdAt: '2026-06-10T10:00:00Z',
  updatedAt: '2026-06-10T10:00:00Z',
  category: {
    id: 'cat-1',
    clinicId: 'clinic-1',
    name: 'Serviços',
    type: 'INCOME',
    isDefault: true,
    createdAt: '',
    updatedAt: '',
  },
}

const expenseTransaction: FinancialTransaction = {
  id: 'tx-expense',
  clinicId: 'clinic-1',
  type: 'EXPENSE',
  source: 'MANUAL',
  categoryId: 'cat-2',
  amount: 5000,
  description: 'Material descartável',
  transactionDate: '2026-06-15',
  status: 'PENDING',
  createdByUserId: 'user-1',
  createdAt: '2026-06-15T10:00:00Z',
  updatedAt: '2026-06-15T10:00:00Z',
  category: {
    id: 'cat-2',
    clinicId: 'clinic-1',
    name: 'Materiais',
    type: 'EXPENSE',
    isDefault: false,
    createdAt: '',
    updatedAt: '',
  },
}

const canceledTransaction: FinancialTransaction = {
  ...expenseTransaction,
  id: 'tx-canceled',
  description: 'Lançamento cancelado',
  status: 'CANCELED',
}

function renderTable(
  transactions: FinancialTransaction[] = [incomeTransaction, expenseTransaction],
  overrides: Partial<Parameters<typeof TransactionsTable>[0]> = {},
) {
  const props = {
    transactions,
    isLoading: false,
    page: 1,
    pageSize: 20,
    total: transactions.length,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    getClassifierState: () => defaultClassifierState,
    onClassify: vi.fn(),
    onApplyCategory: vi.fn(),
    onDismissClassify: vi.fn(),
    ...overrides,
  }
  return { ...props, ...render(<TransactionsTable {...props} />) }
}

describe('TransactionsTable', () => {
  // ── Key fields ────────────────────────────────────────────────────────────

  it('renders transaction description', () => {
    renderTable()
    expect(screen.getAllByText('Consulta ortopédica').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Material descartável').length).toBeGreaterThan(0)
  })

  it('renders transaction category', () => {
    renderTable()
    expect(screen.getAllByText('Serviços').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Materiais').length).toBeGreaterThan(0)
  })

  it('renders transaction status badges', () => {
    renderTable()
    expect(screen.getAllByText('Pago').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0)
  })

  it('renders transaction type labels', () => {
    renderTable()
    expect(screen.getAllByText('Entrada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Saída').length).toBeGreaterThan(0)
  })

  it('renders transaction source labels', () => {
    renderTable()
    expect(screen.getAllByText('Serviço pago').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Manual').length).toBeGreaterThan(0)
  })

  it('renders transaction dates', () => {
    renderTable()
    // formatDate converts ISO to pt-BR — assert partial date string is present
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0)
  })

  // ── Amount styling ─────────────────────────────────────────────────────────

  it('income amount renders with emerald (success) color class', () => {
    renderTable([incomeTransaction])
    // getAllByText matches both mobile card and desktop table
    const amounts = screen.getAllByText(/35\.000|35,000/)
    expect(amounts.length).toBeGreaterThan(0)
    // At least one instance has the emerald class
    const hasEmerald = amounts.some((el) => el.className.includes('emerald'))
    expect(hasEmerald).toBe(true)
  })

  it('expense amount renders with red (danger) color class', () => {
    renderTable([expenseTransaction])
    const amounts = screen.getAllByText(/5\.000|5,000/)
    expect(amounts.length).toBeGreaterThan(0)
    const hasRed = amounts.some((el) => el.className.includes('red'))
    expect(hasRed).toBe(true)
  })

  // ── Action callbacks ───────────────────────────────────────────────────────

  it('edit button calls onEdit with the transaction', () => {
    const { onEdit } = renderTable([incomeTransaction])
    const editButtons = screen.getAllByRole('button', { name: 'Editar lançamento' })
    // First button is mobile card, second is desktop table
    editButtons[0].click()
    expect(onEdit).toHaveBeenCalledWith(incomeTransaction)
  })

  it('delete button calls onDelete with the transaction', () => {
    const { onDelete } = renderTable([incomeTransaction])
    const deleteButtons = screen.getAllByRole('button', { name: 'Cancelar lançamento' })
    deleteButtons[0].click()
    expect(onDelete).toHaveBeenCalledWith(incomeTransaction)
  })

  it('delete button is disabled when transaction status is CANCELED', () => {
    renderTable([canceledTransaction])
    const deleteButtons = screen.getAllByRole('button', { name: 'Cancelar lançamento' })
    for (const btn of deleteButtons) {
      expect(btn).toBeDisabled()
    }
  })

  // ── AI classify ───────────────────────────────────────────────────────────

  it('ExpenseClassifyAction renders for EXPENSE transaction', () => {
    renderTable([expenseTransaction])
    // Both mobile and desktop render classify action — at least one present
    expect(screen.getAllByTestId('classify-tx-expense').length).toBeGreaterThan(0)
  })

  it('ExpenseClassifyAction is absent for INCOME transaction', () => {
    renderTable([incomeTransaction])
    expect(screen.queryByTestId('classify-tx-income')).not.toBeInTheDocument()
  })

  // ── Pagination ────────────────────────────────────────────────────────────

  it('pagination renders', () => {
    renderTable()
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('pagination calls onPageChange when next page is clicked', () => {
    const { onPageChange } = renderTable()
    screen.getByRole('button', { name: 'Próxima página' }).click()
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  // ── Empty state ───────────────────────────────────────────────────────────

  it('renders generic empty state when no transactions and no emptyState prop', () => {
    renderTable([])
    const empties = screen.getAllByText('Nenhuma movimentação encontrada.')
    expect(empties.length).toBeGreaterThan(0)
  })

  it('renders contextual empty state title when emptyState prop is provided', () => {
    renderTable([], {
      emptyState: {
        title: 'Nenhum recebível pendente no período selecionado',
        description:
          'Todas as entradas do período estão pagas ou não há lançamentos pendentes para cobrar.',
        actionLabel: 'Limpar filtros',
        onAction: vi.fn(),
      },
    })
    const titles = screen.getAllByText('Nenhum recebível pendente no período selecionado')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('renders contextual empty state description when emptyState prop is provided', () => {
    renderTable([], {
      emptyState: {
        title: 'Nenhum recebível pendente no período selecionado',
        description:
          'Todas as entradas do período estão pagas ou não há lançamentos pendentes para cobrar.',
      },
    })
    const descriptions = screen.getAllByText(
      'Todas as entradas do período estão pagas ou não há lançamentos pendentes para cobrar.',
    )
    expect(descriptions.length).toBeGreaterThan(0)
  })

  it('renders contextual action button and calls onAction when clicked', () => {
    const onAction = vi.fn()
    renderTable([], {
      emptyState: {
        title: 'Nenhum recebível pendente no período selecionado',
        actionLabel: 'Limpar filtros',
        onAction,
      },
    })
    const buttons = screen.getAllByRole('button', { name: 'Limpar filtros' })
    expect(buttons.length).toBeGreaterThan(0)
    fireEvent.click(buttons[0])
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('does not render contextual empty state when transactions exist', () => {
    renderTable([incomeTransaction], {
      emptyState: {
        title: 'Nenhum recebível pendente no período selecionado',
      },
    })
    expect(
      screen.queryByText('Nenhum recebível pendente no período selecionado'),
    ).not.toBeInTheDocument()
  })

  it('does not render generic empty state when emptyState prop is provided', () => {
    renderTable([], {
      emptyState: { title: 'Nenhum recebível pendente no período selecionado' },
    })
    expect(screen.queryByText('Nenhuma movimentação encontrada.')).not.toBeInTheDocument()
  })

  // ── Desktop wrapper ───────────────────────────────────────────────────────

  it('desktop table wrapper has app-scrollbar class', () => {
    const { container } = renderTable()
    expect(container.querySelector('.app-scrollbar')).toBeInTheDocument()
  })
})
