import { render, screen } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

import { FilterChipGroup } from '@/components/common/FilterChip'

const OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
]

describe('FilterChipGroup', () => {
  it('renders all options', () => {
    render(<FilterChipGroup options={OPTIONS} value="all" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ativos' })).toBeInTheDocument()
  })

  it('marks the active option as pressed', () => {
    render(<FilterChipGroup options={OPTIONS} value="active" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Ativos' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls onChange with the clicked option value', async () => {
    const onChange = vi.fn()
    render(<FilterChipGroup options={OPTIONS} value="all" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Ativos' }))
    expect(onChange).toHaveBeenCalledWith('active')
  })

  it('applies the group aria-label', () => {
    render(
      <FilterChipGroup
        options={OPTIONS}
        value="all"
        onChange={vi.fn()}
        ariaLabel="Filtro de status"
      />,
    )
    expect(screen.getByRole('group', { name: 'Filtro de status' })).toBeInTheDocument()
  })
})
