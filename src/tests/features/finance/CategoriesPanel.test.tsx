import { render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

import { CategoriesPanel } from '@/features/finance/components/CategoriesPanel'
import type { FinancialCategory } from '@/features/finance/types/finance.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const base = {
  clinicId: 'clinic-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const incomeCategory: FinancialCategory = {
  ...base,
  id: 'cat-1',
  name: 'Consultas',
  type: 'INCOME',
  color: '#10B981',
  isDefault: false,
}

const expenseCategory: FinancialCategory = {
  ...base,
  id: 'cat-2',
  name: 'Aluguel',
  type: 'EXPENSE',
  color: '#EF4444',
  isDefault: false,
}

const defaultCategory: FinancialCategory = {
  ...base,
  id: 'cat-3',
  name: 'Outros',
  type: 'EXPENSE',
  color: '#94A3B8',
  isDefault: true,
}

function renderPanel(categories: FinancialCategory[] = []) {
  const onEdit = vi.fn()
  const onDelete = vi.fn()
  return { onEdit, onDelete, ...render(<CategoriesPanel categories={categories} onEdit={onEdit} onDelete={onDelete} />) }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CategoriesPanel', () => {
  // ── Header ─────────────────────────────────────────────────────────────────

  it('renders the panel title', () => {
    renderPanel()
    expect(screen.getByText('Categorias')).toBeInTheDocument()
  })

  it('decorative Layers icon in header has aria-hidden="true"', () => {
    const { container } = renderPanel()
    // The header has a decorative icon — it must be aria-hidden
    // With no categories, the only svg[aria-hidden] in the panel is the Layers header icon
    const hiddenSvg = container.querySelector('svg[aria-hidden="true"]')
    expect(hiddenSvg).toBeInTheDocument()
  })

  // ── Category groups ────────────────────────────────────────────────────────

  it('renders income group label', () => {
    renderPanel([incomeCategory])
    expect(screen.getByText('Entradas')).toBeInTheDocument()
  })

  it('renders expense group label', () => {
    renderPanel([expenseCategory])
    expect(screen.getByText('Saídas')).toBeInTheDocument()
  })

  it('renders category names', () => {
    renderPanel([incomeCategory, expenseCategory])
    expect(screen.getByText('Consultas')).toBeInTheDocument()
    expect(screen.getByText('Aluguel')).toBeInTheDocument()
  })

  it('shows "Nenhuma categoria cadastrada." when group is empty', () => {
    renderPanel([incomeCategory]) // only income — expense group empty
    expect(screen.getByText('Nenhuma categoria cadastrada.')).toBeInTheDocument()
  })

  // ── Default category ───────────────────────────────────────────────────────

  it('shows lock badge for default categories', () => {
    renderPanel([defaultCategory])
    expect(screen.getByText('Padrão')).toBeInTheDocument()
  })

  it('delete button is disabled for default categories', () => {
    renderPanel([defaultCategory])
    const deleteBtn = screen.getByRole('button', { name: /Categorias padrão não podem ser removidas/i })
    expect(deleteBtn).toBeDisabled()
  })

  // ── Actions ────────────────────────────────────────────────────────────────

  it('edit button calls onEdit with the category', () => {
    const { onEdit } = renderPanel([incomeCategory])
    screen.getByRole('button', { name: 'Editar categoria' }).click()
    expect(onEdit).toHaveBeenCalledWith(incomeCategory)
  })

  it('delete button calls onDelete for non-default categories', () => {
    const { onDelete } = renderPanel([incomeCategory])
    screen.getByRole('button', { name: 'Remover categoria' }).click()
    expect(onDelete).toHaveBeenCalledWith(incomeCategory)
  })
})
