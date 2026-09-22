import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockUseTimeline = vi.fn()
vi.mock('@/features/clinical-records/hooks/usePatientClinicalTimeline', () => ({
  usePatientClinicalTimeline: (...args: unknown[]) => mockUseTimeline(...args),
}))

import { PatientHistoryPanel } from '@/features/clinical-records/components/PatientHistoryPanel'
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

describe('PatientHistoryPanel', () => {
  it('passes each stable identity despite identical contacts', () => {
    mockUseTimeline.mockReturnValue({ records: [], isLoading: false, error: null })
    const { rerender } = render(
      <PatientHistoryPanel
        currentRecordId="current"
        identifier="same@example.test"
        patientId="A"
      />,
    )
    expect(mockUseTimeline).toHaveBeenLastCalledWith('same@example.test', 'A')
    rerender(
      <PatientHistoryPanel
        currentRecordId="current"
        identifier="same@example.test"
        patientId="B"
      />,
    )
    expect(mockUseTimeline).toHaveBeenLastCalledWith('same@example.test', 'B')
  })
  it('shows a loading indicator', () => {
    mockUseTimeline.mockReturnValue({ records: [], isLoading: true, error: null })
    render(<PatientHistoryPanel currentRecordId="current" identifier="ana@clinica.com" />)
    expect(screen.getByText('Carregando histórico...')).toBeInTheDocument()
  })

  it('shows a non-blocking error message', () => {
    mockUseTimeline.mockReturnValue({
      records: [],
      isLoading: false,
      error: 'Não foi possível carregar.',
    })
    render(<PatientHistoryPanel currentRecordId="current" identifier="ana@clinica.com" />)
    expect(screen.getByText('Não foi possível carregar.')).toBeInTheDocument()
  })

  it('shows an empty message when there is no other history', () => {
    mockUseTimeline.mockReturnValue({
      records: [makeRecord({ id: 'current' })],
      isLoading: false,
      error: null,
    })
    render(<PatientHistoryPanel currentRecordId="current" identifier="ana@clinica.com" />)
    expect(
      screen.getByText('Este paciente não tem outros atendimentos registrados.'),
    ).toBeInTheDocument()
  })

  it('excludes the current record and sorts the rest most-recent-first', () => {
    mockUseTimeline.mockReturnValue({
      records: [
        makeRecord({ id: 'current' }),
        makeRecord({ id: 'old', createdAt: '2026-01-01T00:00:00.000Z' }),
        makeRecord({ id: 'new', createdAt: '2026-05-01T00:00:00.000Z' }),
      ],
      isLoading: false,
      error: null,
    })
    render(<PatientHistoryPanel currentRecordId="current" identifier="ana@clinica.com" />)
    const links = screen.getAllByRole('link', { name: /ver prontuário completo/i })
    expect(links).toHaveLength(2)
  })

  it('shows a "show more" button when there are more than 5 records, and expands on click', async () => {
    const records = Array.from({ length: 7 }, (_, i) =>
      makeRecord({ id: `r${i}`, createdAt: `2026-01-0${(i % 9) + 1}T00:00:00.000Z` }),
    )
    mockUseTimeline.mockReturnValue({ records, isLoading: false, error: null })
    render(<PatientHistoryPanel currentRecordId="current" identifier="ana@clinica.com" />)

    expect(screen.getAllByRole('link', { name: /ver prontuário completo/i })).toHaveLength(5)
    const button = screen.getByRole('button', { name: /mostrar mais 2 atendimentos/i })

    await userEvent.click(button)
    expect(screen.getAllByRole('link', { name: /ver prontuário completo/i })).toHaveLength(7)
    expect(screen.queryByRole('button', { name: /mostrar mais/i })).not.toBeInTheDocument()
  })

  it('uses singular wording for exactly one remaining record', () => {
    const records = Array.from({ length: 6 }, (_, i) =>
      makeRecord({ id: `r${i}`, createdAt: `2026-01-0${i + 1}T00:00:00.000Z` }),
    )
    mockUseTimeline.mockReturnValue({ records, isLoading: false, error: null })
    render(<PatientHistoryPanel currentRecordId="current" identifier="ana@clinica.com" />)
    expect(screen.getByRole('button', { name: 'Mostrar mais 1 atendimento' })).toBeInTheDocument()
  })

  it('does not show the show-more button when there are 5 or fewer records', () => {
    const records = Array.from({ length: 5 }, (_, i) =>
      makeRecord({ id: `r${i}`, createdAt: `2026-01-0${i + 1}T00:00:00.000Z` }),
    )
    mockUseTimeline.mockReturnValue({ records, isLoading: false, error: null })
    render(<PatientHistoryPanel currentRecordId="current" identifier="ana@clinica.com" />)
    expect(screen.queryByRole('button', { name: /mostrar mais/i })).not.toBeInTheDocument()
  })
})
