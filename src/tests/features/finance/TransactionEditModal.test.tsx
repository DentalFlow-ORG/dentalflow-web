import { render, screen } from '@/test-utils/render-utils'
import type { ReactNode } from 'react'
import { vi } from 'vitest'

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value?: string
    onValueChange?: (v: string) => void
    children?: ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children?: ReactNode }) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: { children?: ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children?: ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

vi.mock('@/components/common/DatePickerInput', () => ({
  DatePickerInput: ({
    id,
    value,
    onValueChange,
  }: {
    id?: string
    value?: string
    onValueChange?: (v: string) => void
  }) => (
    <input type="date" id={id} value={value} onChange={(e) => onValueChange?.(e.target.value)} />
  ),
}))

import { TransactionEditModal } from '@/features/finance/components/TransactionEditModal'
import type {
  FinancialTransaction,
  TransactionFormState,
} from '@/features/finance/types/finance.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockTransaction = {
  id: 'tx-1',
  type: 'INCOME' as const,
  categoryId: 'cat-1',
  amount: 500,
  description: 'Consulta do paciente',
  transactionDate: '2026-06-01',
  dueDate: null,
  status: 'PAID' as const,
  source: 'MANUAL',
  service: null,
  category: null,
} as unknown as FinancialTransaction

const emptyForm: TransactionFormState = {
  type: 'INCOME',
  categoryId: '',
  amount: '',
  description: '',
  transactionDate: '',
  dueDate: '',
  status: 'PAID',
}

function renderModal(transaction: FinancialTransaction | null = mockTransaction) {
  return render(
    <TransactionEditModal
      transaction={transaction}
      form={emptyForm}
      categories={[]}
      error={null}
      isSubmitting={false}
      onChange={vi.fn()}
      onSubmit={vi.fn()}
      onClose={vi.fn()}
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('TransactionEditModal', () => {
  it('renders Dialog.Title when modal is open', () => {
    renderModal()
    expect(screen.getByText('Editar lançamento')).toBeInTheDocument()
  })

  it('renders Dialog.Description for screen readers when modal is open', () => {
    renderModal()
    expect(
      screen.getByText('Atualize os dados do lançamento financeiro selecionado.'),
    ).toBeInTheDocument()
  })

  it('renders description field in the form', () => {
    renderModal()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
  })

  it('does not render modal content when transaction is null', () => {
    renderModal(null)
    expect(screen.queryByText('Editar lançamento')).not.toBeInTheDocument()
  })

  it('Dialog.Content has max-h for viewport-safe scrolling', () => {
    renderModal()
    const content = document.body.querySelector('[role="dialog"]')
    expect(content?.className).toMatch(/max-h-/)
  })

  it('form body area has overflow-y-auto for scrollable content', () => {
    renderModal()
    const scrollable = document.body.querySelector('.overflow-y-auto')
    expect(scrollable).toBeInTheDocument()
  })
})
