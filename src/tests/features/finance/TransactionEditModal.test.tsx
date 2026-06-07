import { render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}))

vi.mock('@/components/common/DatePickerInput', () => ({
  DatePickerInput: ({ id, value, onValueChange }: any) => (
    <input
      type="date"
      id={id}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
    />
  ),
}))

import { TransactionEditModal } from '@/features/finance/components/TransactionEditModal'
import type { TransactionFormState } from '@/features/finance/types/finance.types'

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
} as any

const emptyForm: TransactionFormState = {
  type: 'INCOME',
  categoryId: '',
  amount: '',
  description: '',
  transactionDate: '',
  dueDate: '',
  status: 'PAID',
}

function renderModal(transaction = mockTransaction) {
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
})
