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

import { TransactionEditModal } from '@/features/finance/components/TransactionEditModal'
import type {
  FinancialCategory,
  FinancialTransaction,
  TransactionFormState,
} from '@/features/finance/types/finance.types'

const CATEGORIES: FinancialCategory[] = [
  { id: 'cat-1', name: 'Consultas', type: 'INCOME', color: '#111' } as FinancialCategory,
]

const TRANSACTION: FinancialTransaction = { id: 'tx-1' } as FinancialTransaction

const FORM: TransactionFormState = {
  type: 'INCOME',
  categoryId: 'cat-1',
  amount: '100,00',
  description: 'Consulta',
  transactionDate: '2026-06-01',
  dueDate: '',
  status: 'PAID',
}

function renderModal(overrides: Partial<Parameters<typeof TransactionEditModal>[0]> = {}) {
  const props = {
    transaction: TRANSACTION,
    form: FORM,
    categories: CATEGORIES,
    error: null,
    isSubmitting: false,
    onChange: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    onClose: vi.fn(),
    ...overrides,
  }
  return render(<TransactionEditModal {...props} />)
}

describe('TransactionEditModal', () => {
  it('shows field-specific errors after an incomplete edit is rejected', () => {
    renderModal({
      form: { ...FORM, categoryId: '', amount: '', description: '', transactionDate: '' },
      error: 'Corrija os campos.',
    })
    expect(screen.getByText('Selecione uma categoria.')).toBeInTheDocument()
    expect(screen.getByLabelText('Valor')).toHaveAccessibleDescription(
      'Informe um valor maior que zero.',
    )
    expect(screen.getByLabelText('Descrição')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Descrição')).toHaveAccessibleDescription('Informe a descrição.')
    expect(screen.getByText('Informe a data do lançamento.')).toBeInTheDocument()
  })
  it('closes once when Escape is pressed', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })
  it('renders nothing when transaction is null', () => {
    renderModal({ transaction: null })
    expect(screen.queryByText('Editar lançamento')).not.toBeInTheDocument()
  })

  it('renders the form pre-filled from the transaction when open', () => {
    renderModal()
    expect(screen.getByText('Editar lançamento')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toHaveValue('Consulta')
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

  it('calls onChange when the type select changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[0], 'EXPENSE')
    expect(onChange).toHaveBeenCalledWith('type', 'EXPENSE')
  })

  it('calls onChange when the status select changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[1], 'PENDING')
    expect(onChange).toHaveBeenCalledWith('status', 'PENDING')
  })

  it('calls onChange when the category select changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    const selects = screen.getAllByRole('combobox')
    await userEvent.selectOptions(selects[2], 'cat-1')
    expect(onChange).toHaveBeenCalledWith('categoryId', 'cat-1')
  })

  it('calls onChange when the transaction date changes', () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    const input = document.getElementById('editTxDate') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2026-07-01' } })
    expect(onChange).toHaveBeenCalledWith('transactionDate', '2026-07-01')
  })

  it('calls onChange when the due date changes', () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    const input = document.getElementById('editTxDueDate') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2026-07-10' } })
    expect(onChange).toHaveBeenCalledWith('dueDate', '2026-07-10')
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
    await userEvent.click(screen.getByRole('button', { name: 'Fechar edição de lançamento' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('disables the buttons while submitting', () => {
    renderModal({ isSubmitting: true })
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled()
  })
})
