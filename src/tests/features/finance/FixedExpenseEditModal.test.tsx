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

import { FixedExpenseEditModal } from '@/features/finance/components/FixedExpenseEditModal'
import type {
  FixedExpense,
  FixedExpenseEditFormState,
} from '@/features/finance/types/finance.types'

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
} as unknown as FixedExpense

const emptyForm: FixedExpenseEditFormState = {
  categoryId: '',
  description: '',
  amount: '',
  recurrence: 'MONTHLY',
  dueDay: '1',
  startDate: '',
  endDate: '',
}

function renderModal(expense: FixedExpense | null = mockExpense) {
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
    expect(screen.getByText('Atualize os dados da despesa fixa recorrente.')).toBeInTheDocument()
  })

  it('renders description field in the form', () => {
    renderModal()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
  })

  it('does not render modal content when expense is null', () => {
    renderModal(null)
    expect(screen.queryByText('Editar despesa fixa')).not.toBeInTheDocument()
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
