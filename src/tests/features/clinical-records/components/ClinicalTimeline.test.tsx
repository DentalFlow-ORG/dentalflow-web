import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

import { ClinicalTimeline } from '@/features/clinical-records/components/ClinicalTimeline'
import type { ClinicalRecord } from '@/features/clinical-records/types/clinical-record.types'

function makeRecord(overrides: Partial<ClinicalRecord> = {}): ClinicalRecord {
  return {
    id: 'r1',
    status: 'COMPLETED',
    patientName: 'Ana Martins',
    profile: { id: 'p1', displayName: 'Dra. Carla', userId: null },
    createdAt: '2026-06-01T10:00:00.000Z',
    chiefComplaint: null,
    clinicalEvolution: null,
    odontogramSnapshot: null,
    appointment: null,
    ...overrides,
  } as ClinicalRecord
}

describe('ClinicalTimeline', () => {
  it('shows an empty state when there are no records', () => {
    render(<ClinicalTimeline records={[]} />)
    expect(screen.getByText('Nenhum prontuário encontrado')).toBeInTheDocument()
  })

  it('renders one item per record with the professional name and status', () => {
    render(
      <ClinicalTimeline
        records={[makeRecord({ id: 'r1' }), makeRecord({ id: 'r2', status: 'DRAFT' })]}
      />,
    )
    expect(screen.getAllByText('Dra. Carla')).toHaveLength(2)
    expect(screen.getByText('Concluído')).toBeInTheDocument()
    expect(screen.getByText('Rascunho')).toBeInTheDocument()
  })

  it('shows the appointment service name when present', () => {
    render(
      <ClinicalTimeline
        records={[
          makeRecord({
            appointment: {
              id: 'a1',
              appointmentDate: '2026-06-01',
              startTime: '2026-06-01T10:00:00.000Z',
              endTime: '2026-06-01T11:00:00.000Z',
              status: 'CONFIRMED',
              service: { id: 's1', name: 'Limpeza' },
            },
          }),
        ]}
      />,
    )
    expect(screen.getByText(/Limpeza/)).toBeInTheDocument()
  })

  it('shows the chief complaint when present', () => {
    render(<ClinicalTimeline records={[makeRecord({ chiefComplaint: 'Dor de dente' })]} />)
    expect(screen.getByText(/Dor de dente/)).toBeInTheDocument()
  })

  it('shows the clinical evolution when present', () => {
    render(<ClinicalTimeline records={[makeRecord({ clinicalEvolution: 'Evoluiu bem' })]} />)
    expect(screen.getByText('Evoluiu bem')).toBeInTheDocument()
  })

  it('shows an odontogram condition summary when the snapshot has non-healthy teeth', () => {
    render(
      <ClinicalTimeline
        records={[
          makeRecord({
            odontogramSnapshot: {
              teeth: { '11': { condition: 'caries' }, '21': { condition: 'restored' } },
            },
          }),
        ]}
      />,
    )
    expect(screen.getByLabelText('Resumo do odontograma')).toBeInTheDocument()
  })

  it('does not show the odontogram summary when there is no snapshot', () => {
    render(<ClinicalTimeline records={[makeRecord({ odontogramSnapshot: null })]} />)
    expect(screen.queryByLabelText('Resumo do odontograma')).not.toBeInTheDocument()
  })

  it('links each item to its full record', () => {
    render(<ClinicalTimeline records={[makeRecord({ id: 'r42' })]} />)
    expect(screen.getByRole('link', { name: /ver prontuário completo/i })).toHaveAttribute(
      'href',
      '/app/prontuario/$clinicalRecordId',
    )
  })
})
