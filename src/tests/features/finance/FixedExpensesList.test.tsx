import { fireEvent, render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { FixedExpensesList } from '@/features/finance/components/FixedExpensesList'
import type { FixedExpense } from '@/features/finance/types/finance.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeExpense(overrides: Partial<FixedExpense> = {}): FixedExpense {
  return {
    id: 'fe-1',
    clinicId: 'clinic-1',
    categoryId: 'cat-1',
    description: 'Aluguel da clínica',
    amount: 3000,
    recurrence: 'MONTHLY',
    dueDay: 10,
    startDate: '2026-01-01',
    endDate: null,
    isActive: true,
    createdByUserId: 'user-1',
    category: { id: 'cat-1', name: 'Estrutura', type: 'EXPENSE', clinicId: 'clinic-1', isDefault: false, color: null, createdAt: '', updatedAt: '' },
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

function renderList(
  expenses: FixedExpense[] = [makeExpense()],
  generatingExpenseId: string | null = null,
  onGenerate = vi.fn(),
  onEdit = vi.fn(),
  onToggle = vi.fn(),
) {
  return {
    onGenerate,
    onEdit,
    onToggle,
    ...render(
      <FixedExpensesList
        expenses={expenses}
        generatingExpenseId={generatingExpenseId}
        onGenerate={onGenerate}
        onEdit={onEdit}
        onToggle={onToggle}
      />,
    ),
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('FixedExpensesList', () => {
  // ── Header ─────────────────────────────────────────────────────────────────

  it('renders the section title', () => {
    renderList()
    expect(screen.getByText('Despesas fixas')).toBeInTheDocument()
  })

  it('renders the section sub-description', () => {
    renderList()
    expect(screen.getByText('Custos recorrentes e geração de ocorrências.')).toBeInTheDocument()
  })

  // ── Empty state ────────────────────────────────────────────────────────────

  it('renders dashed empty state when expenses array is empty', () => {
    const { container } = renderList([])
    expect(container.querySelector('.border-dashed')).toBeInTheDocument()
    expect(screen.getByText('Nenhuma despesa fixa cadastrada.')).toBeInTheDocument()
  })

  // ── Item rendering ─────────────────────────────────────────────────────────

  it('renders expense description', () => {
    renderList()
    expect(screen.getByText('Aluguel da clínica')).toBeInTheDocument()
  })

  it('renders expense category name', () => {
    renderList()
    expect(screen.getByText(/Estrutura/)).toBeInTheDocument()
  })

  it('renders expense formatted amount', () => {
    renderList()
    // R$ 3.000,00
    expect(screen.getByText(/3\.000/)).toBeInTheDocument()
  })

  it('renders "Ativa" badge for active expense', () => {
    renderList([makeExpense({ isActive: true })])
    expect(screen.getByText('Ativa')).toBeInTheDocument()
  })

  it('renders "Inativa" badge for inactive expense', () => {
    renderList([makeExpense({ isActive: false })])
    expect(screen.getByText('Inativa')).toBeInTheDocument()
  })

  it('renders recurrence and due day in metadata line', () => {
    renderList()
    expect(screen.getByText(/Mensal/)).toBeInTheDocument()
    expect(screen.getByText(/dia 10/)).toBeInTheDocument()
  })

  // ── Edit button ────────────────────────────────────────────────────────────

  it('edit button has accessible label', () => {
    renderList()
    expect(screen.getByRole('button', { name: 'Editar despesa fixa' })).toBeInTheDocument()
  })

  it('edit button calls onEdit with the expense', () => {
    const expense = makeExpense()
    const { onEdit } = renderList([expense])
    fireEvent.click(screen.getByRole('button', { name: 'Editar despesa fixa' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(expense)
  })

  // ── Toggle button ──────────────────────────────────────────────────────────

  it('toggle button shows "Desativar" label for active expense', () => {
    renderList([makeExpense({ isActive: true })])
    expect(screen.getByRole('button', { name: 'Desativar despesa fixa' })).toBeInTheDocument()
  })

  it('toggle button shows "Ativar" label for inactive expense', () => {
    renderList([makeExpense({ isActive: false })])
    expect(screen.getByRole('button', { name: 'Ativar despesa fixa' })).toBeInTheDocument()
  })

  it('toggle button calls onToggle with the expense', () => {
    const expense = makeExpense({ isActive: true })
    const { onToggle } = renderList([expense])
    fireEvent.click(screen.getByRole('button', { name: 'Desativar despesa fixa' }))
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledWith(expense)
  })

  // ── Generate button ────────────────────────────────────────────────────────

  it('generate button renders with "Gerar" text', () => {
    renderList()
    expect(screen.getByRole('button', { name: /gerar/i })).toBeInTheDocument()
  })

  it('generate button calls onGenerate with the expense', () => {
    const expense = makeExpense()
    const { onGenerate } = renderList([expense])
    fireEvent.click(screen.getByRole('button', { name: /gerar/i }))
    expect(onGenerate).toHaveBeenCalledTimes(1)
    expect(onGenerate).toHaveBeenCalledWith(expense)
  })

  it('generate button is disabled for inactive expense', () => {
    renderList([makeExpense({ isActive: false })])
    expect(screen.getByRole('button', { name: /gerar/i })).toBeDisabled()
  })

  it('generate button is disabled while this expense is generating', () => {
    const expense = makeExpense({ id: 'fe-1' })
    renderList([expense], 'fe-1')
    expect(screen.getByRole('button', { name: /gerar/i })).toBeDisabled()
  })

  it('generate button is enabled while a different expense is generating', () => {
    const expense = makeExpense({ id: 'fe-1' })
    renderList([expense], 'fe-2')
    expect(screen.getByRole('button', { name: /gerar/i })).not.toBeDisabled()
  })

  // ── Multiple expenses ──────────────────────────────────────────────────────

  it('renders multiple expense rows', () => {
    renderList([
      makeExpense({ id: 'fe-1', description: 'Aluguel da clínica' }),
      makeExpense({ id: 'fe-2', description: 'Internet' }),
    ])
    expect(screen.getByText('Aluguel da clínica')).toBeInTheDocument()
    expect(screen.getByText('Internet')).toBeInTheDocument()
  })
})
