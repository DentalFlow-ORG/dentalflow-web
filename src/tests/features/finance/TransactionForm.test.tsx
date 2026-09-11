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

import { TransactionForm } from '@/features/finance/components/TransactionForm'
import type {
  FinancialCategory,
  TransactionFormState,
} from '@/features/finance/types/finance.types'

const defaultForm: TransactionFormState = {
  type: 'INCOME',
  status: 'PAID',
  categoryId: 'cat-1',
  description: '',
  amount: '',
  transactionDate: '2026-06-07',
  dueDate: '',
}

const categories: FinancialCategory[] = [
  {
    id: 'cat-1',
    clinicId: 'clinic-1',
    name: 'Consulta',
    type: 'INCOME',
    isDefault: false,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'cat-2',
    clinicId: 'clinic-1',
    name: 'Material',
    type: 'EXPENSE',
    isDefault: false,
    createdAt: '',
    updatedAt: '',
  },
]

function renderForm(overrides: Partial<Parameters<typeof TransactionForm>[0]> = {}) {
  const props = {
    form: defaultForm,
    categories,
    error: null,
    isSubmitting: false,
    onChange: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    ...overrides,
  }
  return { ...props, ...render(<TransactionForm {...props} />) }
}

// DOM order of native <select> comboboxes: [0] type, [1] status, [2] category
function getSelects() {
  return screen.getAllByRole('combobox')
}

describe('TransactionForm', () => {
  it('passes an optional due date to the transaction draft', () => {
    const { onChange } = renderForm()
    fireEvent.change(screen.getByLabelText(/Vencimento/), { target: { value: '2026-07-15' } })
    expect(onChange).toHaveBeenCalledWith('dueDate', '2026-07-15')
  })
  // ── Section labels ─────────────────────────────────────────────────────────

  it('renders the Classificação section label', () => {
    renderForm()
    expect(screen.getByText('Classificação')).toBeInTheDocument()
  })

  it('renders the Valor e datas section label', () => {
    renderForm()
    expect(screen.getByText('Valor e datas')).toBeInTheDocument()
  })

  // ── Field labels ───────────────────────────────────────────────────────────

  it('renders all 7 field labels', () => {
    renderForm()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
    expect(screen.getByText('Valor')).toBeInTheDocument()
    expect(screen.getByText('Data')).toBeInTheDocument()
    expect(screen.getByText('Vencimento')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
  })

  it('renders "Opcional" badge for the Vencimento field', () => {
    renderForm()
    expect(screen.getByText('Opcional')).toBeInTheDocument()
  })

  // ── Submit button ──────────────────────────────────────────────────────────

  it('renders the submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /salvar lançamento/i })).toBeInTheDocument()
  })

  it('submit button is enabled when not submitting', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /salvar lançamento/i })).not.toBeDisabled()
  })

  it('submit button is disabled while submitting', () => {
    renderForm({ isSubmitting: true })
    expect(screen.getByRole('button', { name: /salvar lançamento/i })).toBeDisabled()
  })

  // ── Error state ────────────────────────────────────────────────────────────

  it('renders error message when error prop is set', () => {
    renderForm({ error: 'Erro ao salvar lançamento.' })
    expect(screen.getByText('Erro ao salvar lançamento.')).toBeInTheDocument()
  })

  it('does not render error block when error is null', () => {
    renderForm({ error: null })
    expect(screen.queryByText('Erro ao salvar lançamento.')).not.toBeInTheDocument()
  })

  // ── Category options ───────────────────────────────────────────────────────

  it('renders category options from props', () => {
    renderForm()
    expect(screen.getByRole('option', { name: 'Consulta' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Material' })).toBeInTheDocument()
  })

  // ── onChange callbacks ─────────────────────────────────────────────────────

  it('calls onChange with (type, EXPENSE) when type select changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(getSelects()[0], { target: { value: 'EXPENSE' } })
    expect(onChange).toHaveBeenCalledWith('type', 'EXPENSE')
  })

  it('calls onChange with (status, PENDING) when status select changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(getSelects()[1], { target: { value: 'PENDING' } })
    expect(onChange).toHaveBeenCalledWith('status', 'PENDING')
  })

  it('calls onChange with (categoryId, cat-2) when category select changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(getSelects()[2], { target: { value: 'cat-2' } })
    expect(onChange).toHaveBeenCalledWith('categoryId', 'cat-2')
  })

  it('calls onChange with (description, value) when description input changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(screen.getByLabelText('Descrição'), {
      target: { value: 'Consulta ortopédica' },
    })
    expect(onChange).toHaveBeenCalledWith('description', 'Consulta ortopédica')
  })

  it('calls onChange with (amount, "0,09") when user types "9" in amount field', () => {
    const { onChange } = renderForm()
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '9' } })
    expect(onChange).toHaveBeenCalledWith('amount', '0,09')
  })

  it('calls onChange with (amount, "90,00") when user types "9000" in amount field', () => {
    const { onChange } = renderForm()
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '9000' } })
    expect(onChange).toHaveBeenCalledWith('amount', '90,00')
  })

  it('calls onChange with (transactionDate, value) when date input changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(document.getElementById('transactionDate')!, {
      target: { value: '2026-06-10' },
    })
    expect(onChange).toHaveBeenCalledWith('transactionDate', '2026-06-10')
  })

  // ── Submit callback ────────────────────────────────────────────────────────

  it('calls onSubmit when form is submitted', () => {
    const { onSubmit } = renderForm()
    fireEvent.submit(screen.getByRole('button', { name: /salvar lançamento/i }).closest('form')!)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
