import userEvent from '@testing-library/user-event'

import { fireEvent, render, screen } from '@/test-utils/render-utils'

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

import { FixedExpenseEditModal } from '@/features/finance/components/FixedExpenseEditModal'
import type {
  FinancialCategory,
  FixedExpense,
  FixedExpenseEditFormState,
} from '@/features/finance/types/finance.types'

const CATEGORIES: FinancialCategory[] = [
  { id: 'cat-1', name: 'Aluguel', type: 'EXPENSE', color: '#111' } as FinancialCategory,
]

const EXPENSE: FixedExpense = { id: 'fx-1' } as FixedExpense

const FORM: FixedExpenseEditFormState = {
  categoryId: 'cat-1',
  description: 'Aluguel',
  amount: '3000,00',
  recurrence: 'MONTHLY',
  dueDay: '5',
  startDate: '2026-06-01',
  endDate: '',
}

function renderModal(overrides: Partial<Parameters<typeof FixedExpenseEditModal>[0]> = {}) {
  const props = {
    expense: EXPENSE,
    form: FORM,
    categories: CATEGORIES,
    error: null,
    isSubmitting: false,
    onChange: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    onClose: vi.fn(),
    ...overrides,
  }
  return render(<FixedExpenseEditModal {...props} />)
}

describe('FixedExpenseEditModal', () => {
  it('shows errors for rejected financial values and invalid recurring dates', () => {
    renderModal({
      form: {
        ...FORM,
        categoryId: '',
        amount: '',
        description: '',
        dueDay: '32',
        endDate: '2026-05-01',
      },
      error: 'Corrija os campos.',
    })
    expect(screen.getByText('Selecione uma categoria.')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor')).toHaveAccessibleDescription(
      'Informe um valor maior que zero.',
    )
    expect(screen.getByLabelText('Descrição')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Informe um dia de vencimento entre 1 e 31.')).toBeInTheDocument()
    expect(
      screen.getByText('A data de término não pode ser anterior à data de início.'),
    ).toBeInTheDocument()
  })
  it('closes once when Escape is pressed', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('changes and clears the optional end date', () => {
    const onChange = vi.fn()
    const { rerender } = renderModal({ onChange })
    fireEvent.change(screen.getByLabelText(/Fim/), { target: { value: '2026-12-31' } })
    expect(onChange).toHaveBeenCalledWith('endDate', '2026-12-31')
    rerender(
      <FixedExpenseEditModal
        expense={EXPENSE}
        form={{ ...FORM, endDate: '2026-12-31' }}
        categories={CATEGORIES}
        error={null}
        isSubmitting={false}
        onChange={onChange}
        onSubmit={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    fireEvent.change(screen.getByLabelText(/Fim/), { target: { value: '' } })
    expect(onChange).toHaveBeenLastCalledWith('endDate', '')
  })
  it('renders nothing when expense is null', () => {
    renderModal({ expense: null })
    expect(screen.queryByText('Editar despesa fixa')).not.toBeInTheDocument()
  })

  it('renders the form pre-filled from the fixed expense when open', () => {
    renderModal()
    expect(screen.getByText('Editar despesa fixa')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toHaveValue('Aluguel')
    expect(screen.getByLabelText('Dia')).toHaveValue('5')
  })

  it('shows the error message when provided', () => {
    renderModal({ error: 'Erro ao salvar.' })
    expect(screen.getByText('Erro ao salvar.')).toBeInTheDocument()
  })

  it('calls onChange when the description changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    await userEvent.type(screen.getByLabelText('Descrição'), 'x')
    expect(onChange).toHaveBeenCalledWith('description', expect.any(String))
  })

  it('calls onChange when the amount changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    await userEvent.type(screen.getByLabelText('Valor'), '1')
    expect(onChange).toHaveBeenCalledWith('amount', expect.any(String))
  })

  it('calls onChange when the due day changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange, form: { ...FORM, dueDay: '' } })
    await userEvent.type(screen.getByLabelText('Dia'), '9')
    expect(onChange).toHaveBeenCalledWith('dueDay', '9')
  })

  it('calls onChange when the category select changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[0], 'cat-1')
    expect(onChange).toHaveBeenCalledWith('categoryId', 'cat-1')
  })

  it('calls onChange when the recurrence select changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], 'YEARLY')
    expect(onChange).toHaveBeenCalledWith('recurrence', 'YEARLY')
  })

  it('calls onChange when the start date changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    const input = document.getElementById('editFeStartDate') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2026-07-01' } })
    expect(onChange).toHaveBeenCalledWith('startDate', '2026-07-01')
  })

  it('calls onSubmit when the form is submitted', async () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
    renderModal({ onSubmit })
    await userEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('calls onClose when Cancelar is clicked', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when the close (X) button is clicked', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.click(screen.getByRole('button', { name: 'Fechar edição de despesa fixa' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('disables the buttons while submitting', () => {
    renderModal({ isSubmitting: true })
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled()
  })
})
