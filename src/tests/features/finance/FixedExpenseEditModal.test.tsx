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

import { FixedExpenseEditModal } from '@/features/finance/components/FixedExpenseEditModal'
import type { FixedExpenseEditFormState } from '@/features/finance/types/finance.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockExpense = {
  id: 'fe-1',
  categoryId: 'cat-1',
  description: 'Aluguel da clínica',
  amount: 3000,
  recurrence: 'MONTHLY' as const,
  dueDay: 10,
  startDate: '2026-01-01',
  endDate: null,
  isActive: true,
  category: null,
} as any

const emptyForm: FixedExpenseEditFormState = {
  categoryId: '',
  description: '',
  amount: '',
  recurrence: 'MONTHLY',
  dueDay: '1',
  startDate: '',
  endDate: '',
}

function renderModal(expense = mockExpense) {
  return render(
    <FixedExpenseEditModal
      expense={expense}
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

describe('FixedExpenseEditModal', () => {
  it('renders Dialog.Title when modal is open', () => {
    renderModal()
    expect(screen.getByText('Editar despesa fixa')).toBeInTheDocument()
  })

  it('renders Dialog.Description for screen readers when modal is open', () => {
    renderModal()
    expect(
      screen.getByText('Atualize os dados da despesa fixa recorrente.'),
    ).toBeInTheDocument()
  })

  it('renders description field in the form', () => {
    renderModal()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
  })

  it('does not render modal content when expense is null', () => {
    renderModal(null)
    expect(screen.queryByText('Editar despesa fixa')).not.toBeInTheDocument()
  })
})
