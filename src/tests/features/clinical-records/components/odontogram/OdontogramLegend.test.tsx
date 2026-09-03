import { render, screen } from '@/test-utils/render-utils'

import { OdontogramLegend } from '@/features/clinical-records/components/odontogram/OdontogramLegend'
import { ODONTOGRAM_CONDITION_OPTIONS } from '@/features/clinical-records/utils/odontogram-status-utils'

describe('OdontogramLegend', () => {
  it('renders a label for every condition option', () => {
    render(<OdontogramLegend />)
    for (const option of ODONTOGRAM_CONDITION_OPTIONS) {
      expect(screen.getByText(option.label)).toBeInTheDocument()
    }
  })

  it('applies compact print-mode styling to the container and each chip', () => {
    const { container } = render(<OdontogramLegend printMode />)
    expect(container.firstChild).toHaveClass('gap-1')
    const firstChip = screen.getByText(ODONTOGRAM_CONDITION_OPTIONS[0].label)
    expect(firstChip).toHaveClass('px-2', 'py-0.5', 'text-[10px]')
  })
})
