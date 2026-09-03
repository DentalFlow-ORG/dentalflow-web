import { render, screen } from '@/test-utils/render-utils'

import { ClinicalRecordStatusBadge } from '@/features/clinical-records/components/ClinicalRecordStatusBadge'

describe('ClinicalRecordStatusBadge', () => {
  it.each([
    ['DRAFT', 'Rascunho'],
    ['COMPLETED', 'Concluído'],
    ['LOCKED', 'Bloqueado'],
    ['CANCELED', 'Cancelado'],
  ] as const)('renders the %s label', (status, label) => {
    render(<ClinicalRecordStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('applies a custom className', () => {
    render(<ClinicalRecordStatusBadge status="DRAFT" className="custom" />)
    expect(screen.getByText('Rascunho')).toHaveClass('custom')
  })
})
