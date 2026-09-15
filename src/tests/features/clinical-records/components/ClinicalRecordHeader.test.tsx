import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

vi.mock('@/features/patients/hooks/usePatientAvatar', () => ({
  usePatientAvatar: () => ({ avatarUrl: null, isSaving: false, update: mockUpdate }),
}))

vi.mock('@/features/patients/components/PatientAvatarWidget', () => ({
  PatientAvatarWidget: ({
    onUpload,
    onError,
  }: {
    onUpload?: (base64: string | null) => void
    onError: (msg: string) => void
  }) => (
    <div>
      {onUpload && (
        <>
          <button type="button" onClick={() => onUpload('data:image/png;base64,abc')}>
            upload-avatar
          </button>
          <button type="button" onClick={() => onUpload(null)}>
            remove-avatar
          </button>
        </>
      )}
      <button type="button" onClick={() => onError('Arquivo inválido')}>
        trigger-error
      </button>
    </div>
  ),
}))

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockUpdate = vi.fn()

import { ClinicalRecordHeader } from '@/features/clinical-records/components/ClinicalRecordHeader'
import type { ClinicalRecord } from '@/features/clinical-records/types/clinical-record.types'

function makeRecord(overrides: Partial<ClinicalRecord> = {}): ClinicalRecord {
  return {
    id: 'r1',
    status: 'DRAFT',
    patientName: 'Ana Martins',
    patientEmail: 'ana@clinica.com',
    patientPhone: '11987654321',
    profile: { id: 'p1', displayName: 'Dra. Carla', userId: null },
    appointment: {
      id: 'a1',
      appointmentDate: '2026-06-10',
      startTime: '2026-06-10T14:00:00.000Z',
      endTime: '2026-06-10T15:00:00.000Z',
      status: 'CONFIRMED',
      service: { id: 's1', name: 'Limpeza' },
    },
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-02T10:00:00.000Z',
    createdByUser: { id: 'u1', firstName: 'João', lastName: 'Silva' },
    updatedByUser: null,
    ...overrides,
  } as ClinicalRecord
}

describe('ClinicalRecordHeader', () => {
  beforeEach(() => {
    mockShowAlert.mockClear()
    mockUpdate.mockClear()
  })

  it('renders patient name, email, and phone', () => {
    render(<ClinicalRecordHeader record={makeRecord()} />)
    expect(screen.getByText('Ana Martins')).toBeInTheDocument()
    expect(screen.getByText('ana@clinica.com')).toBeInTheDocument()
    expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument()
  })

  it('omits email and phone lines when absent', () => {
    render(<ClinicalRecordHeader record={makeRecord({ patientEmail: null, patientPhone: null })} />)
    expect(screen.queryByText('ana@clinica.com')).not.toBeInTheDocument()
  })

  it('shows appointment date, time, and service when present', () => {
    render(<ClinicalRecordHeader record={makeRecord()} />)
    expect(screen.getByText('10/06/2026')).toBeInTheDocument()
    expect(screen.getByText('14:00 – 15:00')).toBeInTheDocument()
    expect(screen.getByText('Limpeza')).toBeInTheDocument()
  })

  it('omits appointment details when there is no appointment', () => {
    render(<ClinicalRecordHeader record={makeRecord({ appointment: null })} />)
    expect(screen.queryByText('Limpeza')).not.toBeInTheDocument()
  })

  it('omits the service row when the appointment has no service', () => {
    render(
      <ClinicalRecordHeader
        record={makeRecord({
          appointment: {
            id: 'a1',
            appointmentDate: '2026-06-10',
            startTime: '2026-06-10T14:00:00.000Z',
            endTime: '2026-06-10T15:00:00.000Z',
            status: 'CONFIRMED',
            service: null,
          },
        })}
      />,
    )
    expect(screen.queryByText('Limpeza')).not.toBeInTheDocument()
  })

  it('shows the audit trail with only the creator when never updated', () => {
    render(<ClinicalRecordHeader record={makeRecord()} />)
    expect(screen.getByText(/criado por/i)).toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.queryByText(/atualizado por/i)).not.toBeInTheDocument()
  })

  it('shows the updater in the audit trail when present', () => {
    render(
      <ClinicalRecordHeader
        record={makeRecord({ updatedByUser: { id: 'u2', firstName: 'Maria', lastName: 'Souza' } })}
      />,
    )
    expect(screen.getByText(/atualizado por/i)).toBeInTheDocument()
    expect(screen.getByText('Maria Souza')).toBeInTheDocument()
  })

  it('hides the avatar upload control when readOnly', () => {
    render(<ClinicalRecordHeader record={makeRecord()} readOnly />)
    expect(screen.queryByRole('button', { name: 'upload-avatar' })).not.toBeInTheDocument()
  })

  it('updates the avatar and shows a success alert', async () => {
    mockUpdate.mockResolvedValue(undefined)
    render(<ClinicalRecordHeader record={makeRecord()} />)
    await userEvent.click(screen.getByRole('button', { name: 'upload-avatar' }))
    expect(mockUpdate).toHaveBeenCalledWith('data:image/png;base64,abc')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Foto atualizada.', tone: 'success' }),
    )
  })

  it('removes the avatar and shows a "removed" alert', async () => {
    mockUpdate.mockResolvedValue(undefined)
    render(<ClinicalRecordHeader record={makeRecord()} />)
    await userEvent.click(screen.getByRole('button', { name: 'remove-avatar' }))
    expect(mockUpdate).toHaveBeenCalledWith(null)
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Foto removida.', tone: 'success' }),
    )
  })

  it('shows an error alert when updating the avatar fails', async () => {
    mockUpdate.mockRejectedValue(new Error('fail'))
    render(<ClinicalRecordHeader record={makeRecord()} />)
    await userEvent.click(screen.getByRole('button', { name: 'upload-avatar' }))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro', tone: 'error' }),
    )
  })

  it('shows an error alert when the avatar file itself is invalid', async () => {
    render(<ClinicalRecordHeader record={makeRecord()} />)
    await userEvent.click(screen.getByRole('button', { name: 'trigger-error' }))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Foto inválida', description: 'Arquivo inválido' }),
    )
  })

  it('renders the creation timestamp in Sao Paulo, not UTC', () => {
    // createdAt/updatedAt are DateTime instants, not @db.Date values: 02:30Z
    // on the 15th is still the 14th in Brazil. Slicing the ISO prefix reported
    // the UTC day and showed these a day late.
    render(<ClinicalRecordHeader record={makeRecord({ createdAt: '2026-10-15T02:30:00.000Z' })} />)
    expect(screen.getByText(/14\/10\/2026/)).toBeInTheDocument()
  })
})
