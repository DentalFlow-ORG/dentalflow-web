import userEvent from '@testing-library/user-event'

import type { PatientSummary } from '@/features/patients/types/patients.types'
import { PatientPicker } from '@/features/scheduling/components/appointments/PatientPicker'
import { usePatientSearch } from '@/features/scheduling/hooks/usePatientSearch'
import { render, screen, within } from '@/test-utils/render-utils'

vi.mock('@/features/scheduling/hooks/usePatientSearch', () => ({
  usePatientSearch: vi.fn(),
}))

const mockedUsePatientSearch = vi.mocked(usePatientSearch)

function patient(overrides: Partial<PatientSummary> = {}): PatientSummary {
  return {
    patientId: 'patient-1',
    identifier: 'ana@exemplo.com',
    patientName: 'Ana Martins',
    patientEmail: 'ana@exemplo.com',
    patientPhone: '11987654321',
    totalAppointments: 1,
    completedAppointments: 1,
    canceledAppointments: 0,
    lastVisit: null,
    ...overrides,
  }
}

describe('PatientPicker', () => {
  beforeEach(() => {
    mockedUsePatientSearch.mockReturnValue({ results: [], status: 'idle' })
  })

  it('shows the selected patient with formatted contact details and allows switching', async () => {
    const onClear = vi.fn()
    render(<PatientPicker selected={patient()} onSelect={vi.fn()} onClear={onClear} />)

    expect(screen.getByText('Ana Martins')).toBeInTheDocument()
    expect(screen.getByText('ana@exemplo.com · (11) 98765-4321')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Trocar paciente' }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('says when the selected patient has no contact on file', () => {
    render(
      <PatientPicker
        selected={patient({ patientEmail: null, patientPhone: null })}
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    expect(screen.getByText('Sem contato cadastrado')).toBeInTheDocument()
  })

  it('lists results, including rows without contact data, and selects the clicked patient', async () => {
    const onSelect = vi.fn()
    const noContact = patient({
      patientId: 'patient-2',
      patientName: 'Bruno Lima',
      patientEmail: null,
      patientPhone: null,
    })
    mockedUsePatientSearch.mockReturnValue({ results: [patient(), noContact], status: 'success' })
    render(<PatientPicker selected={null} onSelect={onSelect} onClear={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Buscar paciente'), 'a')

    expect(screen.getByText('Sem contato cadastrado')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Bruno Lima/ }))
    expect(onSelect).toHaveBeenCalledWith(noContact)
  })

  it('shows a selection error on the search field', () => {
    render(
      <PatientPicker
        selected={null}
        error="Selecione um paciente ou use Novo paciente."
        onSelect={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    const input = screen.getByLabelText('Buscar paciente')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'patientSearchQuery-error')
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Selecione um paciente ou use Novo paciente.',
    )
  })

  it('prompts for a search while the field is empty', () => {
    render(<PatientPicker selected={null} onSelect={vi.fn()} onClear={vi.fn()} />)

    expect(
      screen.getByText('Digite o nome ou e-mail para encontrar um paciente já cadastrado.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Pacientes encontrados' })).not.toBeInTheDocument()
  })

  it('shows a loading status while the search is running', async () => {
    mockedUsePatientSearch.mockReturnValue({ results: [], status: 'loading' })
    render(<PatientPicker selected={null} onSelect={vi.fn()} onClear={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Buscar paciente'), 'Ana')

    expect(screen.getByRole('status')).toHaveTextContent('Buscando pacientes...')
  })

  it('distinguishes no results from a failed search', async () => {
    mockedUsePatientSearch.mockReturnValue({ results: [], status: 'success' })
    const { rerender } = render(
      <PatientPicker selected={null} onSelect={vi.fn()} onClear={vi.fn()} />,
    )
    await userEvent.type(screen.getByLabelText('Buscar paciente'), 'Zé')
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum paciente encontrado.')

    mockedUsePatientSearch.mockReturnValue({ results: [], status: 'error' })
    rerender(<PatientPicker selected={null} onSelect={vi.fn()} onClear={vi.fn()} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível buscar pacientes.')
  })

  it('lists two patients with identical name, e-mail and phone and returns the chosen identity', async () => {
    const onSelect = vi.fn()
    const twinA = patient({ patientId: 'patient-A' })
    const twinB = patient({ patientId: 'patient-B' })
    mockedUsePatientSearch.mockReturnValue({ results: [twinA, twinB], status: 'success' })
    render(<PatientPicker selected={null} onSelect={onSelect} onClear={vi.fn()} />)
    await userEvent.type(screen.getByLabelText('Buscar paciente'), 'Ana')

    const rows = within(screen.getByRole('list', { name: 'Pacientes encontrados' })).getAllByRole(
      'button',
    )
    expect(rows).toHaveLength(2)
    for (const row of rows) expect(row).toHaveTextContent('Ana Martins')

    await userEvent.click(rows[0])
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ patientId: 'patient-A' }))
    await userEvent.click(rows[1])
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ patientId: 'patient-B' }))
  })

  it('does not search while a patient is selected', () => {
    render(<PatientPicker selected={patient()} onSelect={vi.fn()} onClear={vi.fn()} />)

    expect(mockedUsePatientSearch).toHaveBeenLastCalledWith('', false)
  })
})
