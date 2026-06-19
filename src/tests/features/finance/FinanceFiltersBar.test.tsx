import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

// Radix Select does not work in JSDOM — stub with native <select>.
// SelectTrigger accepts (and ignores) the id; selects are found by role+position.
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

// DatePickerInput: stub with native date input (preserves id for getElementById)
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

import { FinanceFiltersBar } from '@/features/finance/components/FinanceFiltersBar'
import type { FinanceFilters, FinancialCategory } from '@/features/finance/types/finance.types'

const baseFilters: FinanceFilters = {
  from: '2026-06-01',
  to: '2026-06-30',
  groupBy: 'day',
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

function renderBar(filters = baseFilters, onChange = vi.fn()) {
  return {
    onChange,
    ...render(<FinanceFiltersBar filters={filters} categories={categories} onChange={onChange} />),
  }
}

// Helper: DOM order of native <select> comboboxes rendered by the Select stub:
//   [0] groupBy  [1] type  [2] status  [3] category
function getSelects() {
  return screen.getAllByRole('combobox')
}

describe('FinanceFiltersBar', () => {
  // ── Labels ────────────────────────────────────────────────────────────────

  it('renders all 6 filter labels', () => {
    renderBar()
    expect(screen.getByText('Início')).toBeInTheDocument()
    expect(screen.getByText('Fim')).toBeInTheDocument()
    expect(screen.getByText('Agrupar')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Categoria')).toBeInTheDocument()
  })

  // ── Fields render ─────────────────────────────────────────────────────────

  it('renders 2 date inputs (by id) and 4 select comboboxes', () => {
    renderBar()
    // DatePickerInput mock preserves the id
    expect(document.getElementById('financeFrom')).toBeInTheDocument()
    expect(document.getElementById('financeTo')).toBeInTheDocument()
    // Select mock renders native <select> with ARIA role combobox
    expect(getSelects()).toHaveLength(4)
  })

  // ── Category options ──────────────────────────────────────────────────────

  it('renders category options from props', () => {
    renderBar()
    expect(screen.getByRole('option', { name: 'Consulta' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Material' })).toBeInTheDocument()
  })

  it('renders "Todas" as the default category option', () => {
    renderBar()
    expect(screen.getByRole('option', { name: 'Todas' })).toBeInTheDocument()
  })

  // ── onChange — date fields ────────────────────────────────────────────────

  it('calls onChange with ("from", value) when from date changes', () => {
    const { onChange } = renderBar()
    fireEvent.change(document.getElementById('financeFrom')!, { target: { value: '2026-05-01' } })
    expect(onChange).toHaveBeenCalledWith('from', '2026-05-01')
  })

  it('calls onChange with ("to", value) when to date changes', () => {
    const { onChange } = renderBar()
    fireEvent.change(document.getElementById('financeTo')!, { target: { value: '2026-05-31' } })
    expect(onChange).toHaveBeenCalledWith('to', '2026-05-31')
  })

  // ── onChange — select fields ──────────────────────────────────────────────

  it('calls onChange with ("groupBy", "month") when groupBy changes', () => {
    const { onChange } = renderBar()
    fireEvent.change(getSelects()[0], { target: { value: 'month' } })
    expect(onChange).toHaveBeenCalledWith('groupBy', 'month')
  })

  it('calls onChange with ("type", "INCOME") when type changes to INCOME', () => {
    const { onChange } = renderBar()
    fireEvent.change(getSelects()[1], { target: { value: 'INCOME' } })
    expect(onChange).toHaveBeenCalledWith('type', 'INCOME')
  })

  it('calls onChange with ("type", undefined) when type changes to "all"', () => {
    const { onChange } = renderBar()
    fireEvent.change(getSelects()[1], { target: { value: 'all' } })
    expect(onChange).toHaveBeenCalledWith('type', undefined)
  })

  it('calls onChange with ("status", "PAID") when status changes', () => {
    const { onChange } = renderBar()
    fireEvent.change(getSelects()[2], { target: { value: 'PAID' } })
    expect(onChange).toHaveBeenCalledWith('status', 'PAID')
  })

  it('calls onChange with ("status", undefined) when status changes to "all"', () => {
    const { onChange } = renderBar()
    fireEvent.change(getSelects()[2], { target: { value: 'all' } })
    expect(onChange).toHaveBeenCalledWith('status', undefined)
  })

  it('calls onChange with ("categoryId", "cat-1") when category changes', () => {
    const { onChange } = renderBar()
    fireEvent.change(getSelects()[3], { target: { value: 'cat-1' } })
    expect(onChange).toHaveBeenCalledWith('categoryId', 'cat-1')
  })

  it('calls onChange with ("categoryId", undefined) when category changes to "all"', () => {
    const { onChange } = renderBar()
    fireEvent.change(getSelects()[3], { target: { value: 'all' } })
    expect(onChange).toHaveBeenCalledWith('categoryId', undefined)
  })

  // ── Responsive grid ───────────────────────────────────────────────────────

  it('filter grid has the new responsive classes (lg:grid-cols-3 and 2xl:grid-cols-6)', () => {
    const { container } = renderBar()
    const grid = container.querySelector('.lg\\:grid-cols-3')
    expect(grid).toBeInTheDocument()
    expect(grid?.className).toMatch(/2xl:grid-cols-6/)
  })

  // ── Active filter feedback ────────────────────────────────────────────────

  it('does not render active filter section when no optional filters are set', () => {
    renderBar(baseFilters)
    expect(screen.queryByText('Limpar filtros')).not.toBeInTheDocument()
    expect(screen.queryByText('Visualizando recebíveis pendentes')).not.toBeInTheDocument()
  })

  it('renders "Visualizando recebíveis pendentes" notice when type=INCOME and status=PENDING', () => {
    renderBar({ ...baseFilters, type: 'INCOME', status: 'PENDING' })
    expect(screen.getByText('Visualizando recebíveis pendentes')).toBeInTheDocument()
    expect(screen.getByText('Entradas pendentes no período selecionado.')).toBeInTheDocument()
  })

  it('renders "Tipo: Entrada" chip when type=INCOME', () => {
    renderBar({ ...baseFilters, type: 'INCOME' })
    expect(screen.getByText('Tipo: Entrada')).toBeInTheDocument()
  })

  it('renders "Tipo: Saída" chip when type=EXPENSE', () => {
    renderBar({ ...baseFilters, type: 'EXPENSE' })
    expect(screen.getByText('Tipo: Saída')).toBeInTheDocument()
  })

  it('renders "Status: Pendente" chip when status=PENDING', () => {
    renderBar({ ...baseFilters, status: 'PENDING' })
    expect(screen.getByText('Status: Pendente')).toBeInTheDocument()
  })

  it('renders "Status: Pago" chip when status=PAID', () => {
    renderBar({ ...baseFilters, status: 'PAID' })
    expect(screen.getByText('Status: Pago')).toBeInTheDocument()
  })

  it('renders category chip with category name when categoryId is set', () => {
    renderBar({ ...baseFilters, categoryId: 'cat-1' })
    expect(screen.getByText('Categoria: Consulta')).toBeInTheDocument()
  })

  it('does not render drill-down notice when only type=INCOME without status=PENDING', () => {
    renderBar({ ...baseFilters, type: 'INCOME' })
    expect(screen.queryByText('Visualizando recebíveis pendentes')).not.toBeInTheDocument()
  })

  it('renders "Limpar filtros" button when any optional filter is active', () => {
    renderBar({ ...baseFilters, status: 'PAID' })
    expect(screen.getByRole('button', { name: /Limpar filtros/ })).toBeInTheDocument()
  })

  it('clicking "Limpar filtros" calls onChange for type, status, and categoryId with undefined', () => {
    const { onChange } = renderBar({
      ...baseFilters,
      type: 'INCOME',
      status: 'PENDING',
      categoryId: 'cat-1',
    })
    fireEvent.click(screen.getByRole('button', { name: /Limpar filtros/ }))
    expect(onChange).toHaveBeenCalledWith('type', undefined)
    expect(onChange).toHaveBeenCalledWith('status', undefined)
    expect(onChange).toHaveBeenCalledWith('categoryId', undefined)
  })
})
