import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { ReportFilterChips } from '@/features/reports/components/ReportFilterChips'
import type { FilterChip } from '@/features/reports/utils/report-filter-chips'

const CHIPS: FilterChip[] = [
  { key: 'status', label: 'Status: Pago' },
  { key: 'type', label: 'Tipo: Receita' },
]

describe('ReportFilterChips', () => {
  it('renders nothing when there are no chips', () => {
    const { container } = render(<ReportFilterChips chips={[]} onClear={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a chip for each filter', () => {
    render(<ReportFilterChips chips={CHIPS} onClear={vi.fn()} />)
    expect(screen.getByText('Status: Pago')).toBeInTheDocument()
    expect(screen.getByText('Tipo: Receita')).toBeInTheDocument()
  })

  it('calls onClear when the clear button is clicked', async () => {
    const onClear = vi.fn()
    render(<ReportFilterChips chips={CHIPS} onClear={onClear} />)
    await userEvent.click(screen.getByRole('button', { name: /limpar filtros/i }))
    expect(onClear).toHaveBeenCalledOnce()
  })
})
