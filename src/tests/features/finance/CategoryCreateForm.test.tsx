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

import { CategoryCreateForm } from '@/features/finance/components/CategoryCreateForm'
import type { CategoryFormState } from '@/features/finance/types/finance.types'

const defaultForm: CategoryFormState = {
  type: 'INCOME',
  name: '',
  color: '#10B981',
}

function renderForm(
  overrides: Partial<Parameters<typeof CategoryCreateForm>[0]> = {},
) {
  const props = {
    form: defaultForm,
    error: null,
    isSubmitting: false,
    onChange: vi.fn(),
    onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
    ...overrides,
  }
  return { ...props, ...render(<CategoryCreateForm {...props} />) }
}

describe('CategoryCreateForm', () => {
  // ── Section label ──────────────────────────────────────────────────────────

  it('renders the Identificação visual section label', () => {
    renderForm()
    expect(screen.getByText('Identificação visual')).toBeInTheDocument()
  })

  // ── Field labels ───────────────────────────────────────────────────────────

  it('renders Tipo, Nome and Cor field labels', () => {
    renderForm()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Cor')).toBeInTheDocument()
  })

  // ── Color picker accessibility ─────────────────────────────────────────────

  it('renders 10 accessible color swatch buttons', () => {
    renderForm()
    const swatches = screen.getAllByRole('button', { name: /Selecionar cor:/i })
    expect(swatches).toHaveLength(10)
  })

  it('color swatch for Verde has aria-pressed=true when selected', () => {
    renderForm({ form: { ...defaultForm, color: '#10B981' } })
    const verdeBtn = screen.getByRole('button', { name: 'Selecionar cor: Verde' })
    expect(verdeBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('other color swatches have aria-pressed=false when not selected', () => {
    renderForm({ form: { ...defaultForm, color: '#10B981' } })
    const indigoBtn = screen.getByRole('button', { name: 'Selecionar cor: Índigo' })
    expect(indigoBtn).toHaveAttribute('aria-pressed', 'false')
  })

  // ── Submit button ──────────────────────────────────────────────────────────

  it('renders the submit button', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /criar categoria/i })).toBeInTheDocument()
  })

  it('submit button is enabled when not submitting', () => {
    renderForm()
    expect(screen.getByRole('button', { name: /criar categoria/i })).not.toBeDisabled()
  })

  it('submit button is disabled while submitting', () => {
    renderForm({ isSubmitting: true })
    expect(screen.getByRole('button', { name: /criar categoria/i })).toBeDisabled()
  })

  // ── Error state ────────────────────────────────────────────────────────────

  it('renders error message when error prop is set', () => {
    renderForm({ error: 'Erro ao criar categoria.' })
    expect(screen.getByText('Erro ao criar categoria.')).toBeInTheDocument()
  })

  it('does not render error block when error is null', () => {
    renderForm({ error: null })
    expect(screen.queryByText('Erro ao criar categoria.')).not.toBeInTheDocument()
  })

  // ── onChange callbacks ─────────────────────────────────────────────────────

  it('calls onChange with (type, EXPENSE) when type select changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'EXPENSE' } })
    expect(onChange).toHaveBeenCalledWith('type', 'EXPENSE')
  })

  it('calls onChange with (name, value) when name input changes', () => {
    const { onChange } = renderForm()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Marketing' } })
    expect(onChange).toHaveBeenCalledWith('name', 'Marketing')
  })

  it('calls onChange with (color, hex) when a color swatch is clicked', () => {
    const { onChange } = renderForm()
    const vermelhoBtn = screen.getByRole('button', { name: 'Selecionar cor: Vermelho' })
    fireEvent.click(vermelhoBtn)
    expect(onChange).toHaveBeenCalledWith('color', '#EF4444')
  })

  // ── Submit callback ────────────────────────────────────────────────────────

  it('calls onSubmit when form is submitted', () => {
    const { onSubmit } = renderForm()
    fireEvent.submit(screen.getByRole('button', { name: /criar categoria/i }).closest('form')!)
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
