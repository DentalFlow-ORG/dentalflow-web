import { render, screen } from '@/test-utils/render-utils'
import { vi } from 'vitest'

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}))

import { CategoryEditModal } from '@/features/finance/components/CategoryEditModal'
import type { CategoryFormState } from '@/features/finance/types/finance.types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockCategory = {
  id: 'cat-1',
  name: 'Consultas',
  type: 'INCOME' as const,
  color: '#10B981',
  isDefault: false,
} as any

const emptyForm: CategoryFormState = {
  name: '',
  type: 'INCOME',
  color: '#10B981',
}

function renderModal(category = mockCategory) {
  return render(
    <CategoryEditModal
      category={category}
      form={emptyForm}
      error={null}
      isSubmitting={false}
      onChange={vi.fn()}
      onSubmit={vi.fn()}
      onClose={vi.fn()}
    />,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CategoryEditModal', () => {
  it('renders Dialog.Title when modal is open', () => {
    renderModal()
    expect(screen.getByText('Editar categoria')).toBeInTheDocument()
  })

  it('renders Dialog.Description for screen readers when modal is open', () => {
    renderModal()
    expect(
      screen.getByText('Atualize o nome, tipo e cor da categoria financeira.'),
    ).toBeInTheDocument()
  })

  it('renders name field in the form', () => {
    renderModal()
    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
  })

  it('does not render modal content when category is null', () => {
    renderModal(null)
    expect(screen.queryByText('Editar categoria')).not.toBeInTheDocument()
  })
})
