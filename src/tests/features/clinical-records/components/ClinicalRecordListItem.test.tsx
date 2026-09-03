import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

import { ClinicalRecordListItem } from '@/features/clinical-records/components/ClinicalRecordListItem'
import type { ClinicalRecord } from '@/features/clinical-records/types/clinical-record.types'

function makeRecord(overrides: Partial<ClinicalRecord> = {}): ClinicalRecord {
  return {
    id: 'r1',
    status: 'DRAFT',
    patientName: 'Ana Martins',
    patientEmail: 'ana@clinica.com',
    profile: { id: 'p1', displayName: 'Dra. Carla' },
    chiefComplaint: 'Dor de dente',
    createdAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  } as ClinicalRecord
}

describe('ClinicalRecordListItem', () => {
  it('links to the record detail route', () => {
    render(<ClinicalRecordListItem record={makeRecord()} />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/app/prontuario/$clinicalRecordId')
  })

  it('renders patient name, email, professional and status', () => {
    render(<ClinicalRecordListItem record={makeRecord()} />)
    expect(screen.getAllByText('Ana Martins').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ana@clinica.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dra. Carla').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Rascunho').length).toBeGreaterThan(0)
  })

  it('omits the email line when patientEmail is absent', () => {
    render(<ClinicalRecordListItem record={makeRecord({ patientEmail: null })} />)
    expect(screen.queryByText('ana@clinica.com')).not.toBeInTheDocument()
  })

  it('shows the chief complaint when present', () => {
    render(<ClinicalRecordListItem record={makeRecord()} />)
    expect(screen.getAllByText('Dor de dente').length).toBeGreaterThan(0)
  })

  it('shows a dash placeholder in the desktop complaint column when absent', () => {
    render(<ClinicalRecordListItem record={makeRecord({ chiefComplaint: null })} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
