import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

vi.mock('@/components/ui/select', () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string
    onValueChange: (v: string) => void
    children: React.ReactNode
  }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode; id?: string }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <option value="">{placeholder}</option>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

vi.mock('@/components/common/DatePickerInput', () => ({
  DatePickerInput: ({
    id,
    value,
    onValueChange,
  }: {
    id: string
    value: string
    onValueChange: (v: string) => void
  }) => <input id={id} type="date" value={value} onChange={(e) => onValueChange(e.target.value)} />,
}))

import { FixedExpenseForm } from '@/features/finance/components/FixedExpenseForm'
import type {
  FinancialCategory,
  FixedExpenseFormState,
} from '@/features/finance/types/finance.types'

const defaultForm: FixedExpenseFormState = {
  categoryId: 'cat-1',
  description: '',
  amount: '',
  recurrence: 'MONTHLY',
  dueDay: '',
  startDate: '2026-06-01',
}

const categories: FinancialCategory[] = [
  {
    id: 'cat-1',
    clinicId: 'clinic-1',
    name: 'Aluguel',
    type: 'EXPENSE',
    isDefault: false,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-2',
    clinicId: 'clinic-1',
    name: 'Energia',
    type: 'EXPENSE',
    isDefault: false,
    createdAt: '',
    updatedAt: '',
  },
]

function renderForm(overrides: Partial<Parameters<typeof FixedExpenseForm>[0]> = {}) {
  const props = {
    form: defaultForm,
    categories,
    error: null,
    isSubmitting: false,
    onChange: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    ...overrides,
  }
  return { ...props, ...render(<FixedExpenseForm {...props} />) }
}

// DOM order of native <select> comboboxes: [0] category, [1] recurrence
function getSelects() {
  return screen.getAllByRole('combobox')
}

describe('FixedExpenseForm', () => {
  // ── Section labels ─────────────────────────────────────────────────────────

  it('renders the Identificação section label', () => {
    renderForm()
    expect(screen.getByText('Identificação')).toBeInTheDocument()
  })

  it('renders the Recorrência section label', () => {
    renderForm()
    // "Recorrência" appears as both a section label and a field label — at least 2
    expect(screen.getAllByText('Recorrência').length).toBeGreaterThanOrEqual(2)
  })

  // ── Field labels ───────────────────────────────────────────────────────────

  it('renders all field labels', () => {
    renderForm()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(screen.getByText('Valor')).toBeInTheDocument()
    expect(screen.getByText('Dia')).toBeInTheDocument()
    expect(screen.getByText('Início')).toBeInTheDocument()
  })

  // ── Submit button ──────────────────────────────────────────────────────────

  it('renders the submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /salvar despesa fixa/i })).toBeInTheDocument()
  })

  it('submit button is enabled when not submitting', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /salvar despesa fixa/i })).not.toBeDisabled()
  })

  it('submit button is disabled while submitting', () => {
    renderForm({ isSubmitting: true })
    expect(screen.getByRole('button', { name: /salvar despesa fixa/i })).toBeDisabled()
  })

  // ── Error state ────────────────────────────────────────────────────────────

  it('renders error message when error prop is set', () => {
    renderForm({ error: 'Erro ao salvar despesa fixa.' })
    expect(screen.getByText('Erro ao salvar despesa fixa.')).toBeInTheDocument()
  })

  it('does not render error block when error is null', () => {
    renderForm({ error: null })
    expect(screen.queryByText('Erro ao salvar despesa fixa.')).not.toBeInTheDocument()
  })

  // ── Category options ───────────────────────────────────────────────────────

  it('renders category options from props', () => {
    renderForm()
    expect(screen.getByRole('option', { name: 'Aluguel' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Energia' })).toBeInTheDocument()
  })

  // ── onChange callbacks ─────────────────────────────────────────────────────

  it('calls onChange with (categoryId, cat-2) when category select changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(getSelects()[0], { target: { value: 'cat-2' } })
    expect(onChange).toHaveBeenCalledWith('categoryId', 'cat-2')
  })

  it('calls onChange with (recurrence, YEARLY) when recurrence select changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(getSelects()[1], { target: { value: 'YEARLY' } })
    expect(onChange).toHaveBeenCalledWith('recurrence', 'YEARLY')
  })

  it('calls onChange with (description, value) when description input changes', () => {
    const { onChange } = renderForm()
    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'Aluguel da clínica' } })
    expect(onChange).toHaveBeenCalledWith('description', 'Aluguel da clínica')
  })

  it('calls onChange with (startDate, value) when start date changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(document.getElementById('fixedStartDate')!, {
      target: { value: '2026-07-01' },
    })
    expect(onChange).toHaveBeenCalledWith('startDate', '2026-07-01')
  })

  // ── Submit callback ────────────────────────────────────────────────────────

  it('calls onSubmit when form is submitted', () => {
    const { onSubmit } = renderForm()
    fireEvent.submit(screen.getByRole('button', { name: /salvar despesa fixa/i }).closest('form')!)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
