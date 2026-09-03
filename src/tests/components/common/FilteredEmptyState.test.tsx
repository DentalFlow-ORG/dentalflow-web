import userEvent from '@testing-library/user-event'
import { Search } from 'lucide-react'

import { render, screen } from '@/test-utils/render-utils'

import { FilteredEmptyState } from '@/components/common/FilteredEmptyState'

describe('FilteredEmptyState', () => {
  it('renders the standard "no results" copy', () => {
    render(<FilteredEmptyState icon={Search} onClear={vi.fn()} />)
    expect(screen.getByText('Nenhum resultado encontrado')).toBeInTheDocument()
  })

  it('calls onClear when the button is clicked', async () => {
    const onClear = vi.fn()
    render(<FilteredEmptyState icon={Search} onClear={onClear} />)
    await userEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
