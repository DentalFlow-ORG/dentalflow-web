import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

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
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}))

import { CategoryEditModal } from '@/features/finance/components/CategoryEditModal'
import type { CategoryFormState, FinancialCategory } from '@/features/finance/types/finance.types'

const CATEGORY: FinancialCategory = {
  id: 'cat-1',
  name: 'Consultas',
  type: 'INCOME',
  color: '#10B981',
} as FinancialCategory

const FORM: CategoryFormState = { type: 'INCOME', name: 'Consultas', color: '#10B981' }

function renderModal(overrides: Partial<Parameters<typeof CategoryEditModal>[0]> = {}) {
  const props = {
    category: CATEGORY,
    form: FORM,
    error: null,
    isSubmitting: false,
    onChange: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    onClose: vi.fn(),
    ...overrides,
  }
  return { ...render(<CategoryEditModal {...props} />), props }
}

describe('CategoryEditModal', () => {
  it('associates a rejected blank name with the editable field', () => {
    renderModal({ form: { ...FORM, name: '' }, error: 'Corrija os campos.' })
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Nome')).toHaveAccessibleDescription(
      'Informe o nome da categoria.',
    )
  })
  it('closes once when Escape is pressed', async () => {
    const onClose = vi.fn()
    renderModal({ onClose })
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('changes the category color through the shared picker', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar cor: Azul' }))
    expect(onChange).toHaveBeenCalledWith('color', '#0EA5E9')
  })
  it('renders nothing when category is null', () => {
    renderModal({ category: null })
    expect(screen.queryByText('Editar categoria')).not.toBeInTheDocument()
  })

  it('renders the form pre-filled from the category when open', () => {
    renderModal()
    expect(screen.getByText('Editar categoria')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome')).toHaveValue('Consultas')
  })

  it('shows the error message when provided', () => {
    renderModal({ error: 'Nome já utilizado.' })
    expect(screen.getByText('Nome já utilizado.')).toBeInTheDocument()
  })

  it('calls onChange with the new name as the user types', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    await userEvent.type(screen.getByLabelText('Nome'), 'x')
    expect(onChange).toHaveBeenCalledWith('name', expect.any(String))
  })

  it('calls onChange when the type select changes', async () => {
    const onChange = vi.fn()
    renderModal({ onChange })
    await userEvent.selectOptions(screen.getByRole('combobox'), 'EXPENSE')
    expect(onChange).toHaveBeenCalledWith('type', 'EXPENSE')
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
    await userEvent.click(screen.getByRole('button', { name: 'Fechar edição de categoria' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('disables the buttons and shows the spinner while submitting', () => {
    renderModal({ isSubmitting: true })
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeDisabled()
  })
})
