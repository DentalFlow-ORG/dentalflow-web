import { act, render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

import type {
  ClinicalRecord,
  OdontogramData,
  PrintData,
} from '@/features/clinical-records/types/clinical-record.types'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockGetClinicalRecordPrintData = vi.fn()
const mockGetOdontogram = vi.fn()
vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  getClinicalRecordPrintData: (...args: unknown[]) => mockGetClinicalRecordPrintData(...args),
  getOdontogram: (...args: unknown[]) => mockGetOdontogram(...args),
}))

import { ClinicalRecordPrintContainer } from '@/features/clinical-records/containers/ClinicalRecordPrintContainer'

function makeRecord(overrides: Partial<ClinicalRecord> = {}): ClinicalRecord {
  return {
    id: 'rec-1',
    clinicId: 'clinic-1',
    appointmentId: null,
    profileId: 'prof-1',
    patientName: 'Ana Martins',
    patientEmail: 'ana@clinica.com',
    patientPhone: '11987654321',
    status: 'COMPLETED',
    chiefComplaint: null,
    anamnesis: null,
    clinicalEvolution: null,
    diagnosis: null,
    proceduresPerformed: null,
    treatmentPlan: null,
    prescription: null,
    recommendations: null,
    privateNotes: null,
    aiDraft: null,
    aiSummary: null,
    odontogramSnapshot: null,
    printedAt: null,
    completedAt: null,
    lockedAt: null,
    createdByUserId: 'user-1',
    updatedByUserId: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    profile: { id: 'prof-1', displayName: 'Dra. Ana', userId: 'user-1' },
    appointment: null,
    createdByUser: { id: 'user-1', firstName: 'Ana', lastName: 'Martins' },
    updatedByUser: null,
    attachments: [],
    ...overrides,
  }
}

function makePrintData(overrides: Partial<PrintData> = {}): PrintData {
  return {
    clinic: {
      name: 'Clínica Demo',
      email: 'contato@clinica.com',
      phone: '11987654321',
      addressLine1: 'Rua das Flores, 100',
      city: 'São Paulo',
      state: 'SP',
    },
    record: { ...makeRecord(), attachments: [] },
    ...overrides,
  }
}

const ODONTOGRAM_DATA: OdontogramData = {
  teeth: { '11': { condition: 'CARIES' } },
  notes: 'Observação geral',
}

describe('ClinicalRecordPrintContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia
  })

  it('shows a loading indicator while data is being fetched', () => {
    mockGetClinicalRecordPrintData.mockReturnValue(new Promise(() => {}))
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    expect(screen.getByText('Preparando prontuário para impressão...')).toBeInTheDocument()
  })

  it('shows an error message when loading fails', async () => {
    mockGetClinicalRecordPrintData.mockRejectedValue(new Error('network error'))
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    expect(
      await screen.findByText('Não foi possível carregar os dados para impressão.'),
    ).toBeInTheDocument()
  })

  it('renders the clinic and patient header once data loads', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(makePrintData())
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)

    expect(await screen.findByText('Clínica Demo')).toBeInTheDocument()
    expect(screen.getAllByText('Ana Martins').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Dra. Ana').length).toBeGreaterThan(0)
  })

  it('falls back to a generic clinic name when clinic is null', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(makePrintData({ clinic: null }))
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    expect(await screen.findByText('Clínica')).toBeInTheDocument()
  })

  it('renders each populated clinical section', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(
      makePrintData({
        record: {
          ...makeRecord({
            chiefComplaint: 'Dor de dente',
            anamnesis: 'Sem histórico relevante',
            clinicalEvolution: 'Evoluindo bem',
            diagnosis: 'Cárie',
            proceduresPerformed: 'Restauração',
            treatmentPlan: 'Retorno em 30 dias',
            prescription: 'Amoxicilina',
            recommendations: 'Evitar doces',
          }),
          attachments: [],
        },
      }),
    )
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)

    await screen.findByText('Dor de dente')
    expect(screen.getByText('Sem histórico relevante')).toBeInTheDocument()
    expect(screen.getByText('Evoluindo bem')).toBeInTheDocument()
    expect(screen.getByText('Cárie')).toBeInTheDocument()
    expect(screen.getByText('Restauração')).toBeInTheDocument()
    expect(screen.getByText('Retorno em 30 dias')).toBeInTheDocument()
    expect(screen.getByText('Amoxicilina')).toBeInTheDocument()
    expect(screen.getByText('Evitar doces')).toBeInTheDocument()
  })

  it('does not render optional sections when the fields are empty', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(makePrintData())
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    await screen.findByText('Paciente')
    expect(screen.queryByText('Queixa principal')).not.toBeInTheDocument()
  })

  it('renders the odontogram section when odontogram data with teeth or notes is available', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(makePrintData())
    mockGetOdontogram.mockResolvedValue({ data: ODONTOGRAM_DATA })
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    expect(await screen.findByText('Odontograma')).toBeInTheDocument()
    expect(screen.getByText('Observação geral')).toBeInTheDocument()
  })

  it('does not render the odontogram section when the odontogram lookup fails', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(makePrintData())
    mockGetOdontogram.mockRejectedValue(new Error('not found'))
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    await screen.findByText('Paciente')
    expect(screen.queryByText('Odontograma')).not.toBeInTheDocument()
  })

  it('does not render the odontogram section when it has no teeth and no notes', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(makePrintData())
    mockGetOdontogram.mockResolvedValue({ data: { teeth: {} } })
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    await screen.findByText('Paciente')
    expect(screen.queryByText('Odontograma')).not.toBeInTheDocument()
  })

  it('prints a notes-only odontogram and a clinic city without a state', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(
      makePrintData({
        clinic: {
          name: 'Clínica Demo',
          email: null,
          phone: null,
          addressLine1: null,
          city: 'Santos',
          state: null,
        },
      }),
    )
    mockGetOdontogram.mockResolvedValue({ data: { notes: 'Reavaliar oclusão' } })
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    expect(await screen.findByText('Reavaliar oclusão')).toBeInTheDocument()
    expect(screen.getByText('Santos')).toBeInTheDocument()
    expect(screen.getByText('Odontograma')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /imprimir/i })).toBeEnabled()
  })

  it('renders attachments when present', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(
      makePrintData({
        record: {
          ...makeRecord(),
          attachments: [
            {
              id: 'att-1',
              clinicId: 'clinic-1',
              clinicalRecordId: 'rec-1',
              fileName: 'raio-x.jpg',
              fileType: 'image',
              mimeType: null,
              sizeBytes: 1000,
              storageKey: null,
              dataBase64: 'ZmFrZS1kYXRh',
              thumbnailBase64: null,
              description: 'Raio-X panorâmico',
              uploadedByUserId: 'user-1',
              createdAt: '2026-06-01T00:00:00.000Z',
            },
          ],
        },
      }),
    )
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    expect(await screen.findByText('Imagens clínicas')).toBeInTheDocument()
    expect(screen.getByText('Raio-X panorâmico')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'raio-x.jpg' })).toHaveAttribute(
      'src',
      'data:image/jpeg;base64,ZmFrZS1kYXRh',
    )
  })

  it('renders a placeholder for an attachment without base64 data', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(
      makePrintData({
        record: {
          ...makeRecord(),
          attachments: [
            {
              id: 'att-1',
              clinicId: 'clinic-1',
              clinicalRecordId: 'rec-1',
              fileName: 'sem-imagem.jpg',
              fileType: 'image',
              mimeType: null,
              sizeBytes: null,
              storageKey: 'key-1',
              dataBase64: null,
              thumbnailBase64: null,
              description: null,
              uploadedByUserId: 'user-1',
              createdAt: '2026-06-01T00:00:00.000Z',
            },
          ],
        },
      }),
    )
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    expect(await screen.findByText('sem-imagem.jpg')).toBeInTheDocument()
  })

  it('resolves the odontogram identifier by email when available', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(makePrintData())
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    await waitFor(() => expect(mockGetOdontogram).toHaveBeenCalledWith('ana@clinica.com'))
  })

  it('falls back to patientName as the odontogram identifier when there is no email', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(
      makePrintData({ record: { ...makeRecord({ patientEmail: null }), attachments: [] } }),
    )
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    await waitFor(() => expect(mockGetOdontogram).toHaveBeenCalledWith('Ana Martins'))
  })

  it('renders the appointment date and status label when there is an appointment', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(
      makePrintData({
        record: {
          ...makeRecord({
            status: 'LOCKED',
            appointment: {
              id: 'appt-1',
              appointmentDate: '2026-06-15',
              startTime: '09:00',
              endTime: '09:30',
              status: 'COMPLETED',
              service: { id: 'svc-1', name: 'Limpeza' },
            },
          }),
          attachments: [],
        },
      }),
    )
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    await screen.findByText('Paciente')
    expect(screen.getByText(/Bloqueado/)).toBeInTheDocument()
  })

  it('triggers window.print and restores the document title', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(makePrintData())
    mockGetOdontogram.mockResolvedValue(null)
    const printSpy = vi.fn()
    window.print = printSpy
    document.title = 'DentalFlow'

    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    await userEvent.click(await screen.findByRole('button', { name: /imprimir/i }))

    expect(printSpy).toHaveBeenCalledOnce()
    expect(document.title).toBe('DentalFlow')
  })

  it('links back to the clinical record view', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValue(makePrintData())
    mockGetOdontogram.mockResolvedValue(null)
    render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    const link = await screen.findByRole('link', { name: /voltar ao prontuário/i })
    expect(link).toHaveAttribute('href', '/app/prontuario/$clinicalRecordId')
  })

  it('hides the previous patient while preparing another record and clears its odontogram', async () => {
    mockGetClinicalRecordPrintData.mockResolvedValueOnce(makePrintData())
    mockGetOdontogram.mockResolvedValueOnce({ data: ODONTOGRAM_DATA }).mockResolvedValueOnce(null)
    const view = render(<ClinicalRecordPrintContainer recordId="rec-1" />)
    await screen.findByText('Observação geral')
    let resolve!: (data: PrintData) => void
    mockGetClinicalRecordPrintData.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      }),
    )
    view.rerender(<ClinicalRecordPrintContainer recordId="rec-2" />)
    expect(screen.queryByText('Observação geral')).not.toBeInTheDocument()
    expect(screen.queryByText('Ana Martins')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /imprimir/i })).not.toBeInTheDocument()
    expect(screen.getByText('Preparando prontuário para impressão...')).toBeInTheDocument()
    await act(async () => {
      resolve(
        makePrintData({
          record: { ...makeRecord({ id: 'rec-2', patientName: 'Bruno Silva' }), attachments: [] },
        }),
      )
    })
    expect(screen.getAllByText('Bruno Silva')).toHaveLength(2)
    expect(screen.queryByText('Observação geral')).not.toBeInTheDocument()
    expect(screen.queryByText('Ana Martins')).not.toBeInTheDocument()
  })

  it('recovers from a load failure when opening another record', async () => {
    mockGetClinicalRecordPrintData
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(makePrintData())
    mockGetOdontogram.mockResolvedValueOnce(null)
    const view = render(<ClinicalRecordPrintContainer recordId="failed" />)
    await screen.findByText('Não foi possível carregar os dados para impressão.')
    view.rerender(<ClinicalRecordPrintContainer recordId="rec-1" />)
    expect(await screen.findByRole('button', { name: /imprimir/i })).toBeEnabled()
    expect(
      screen.queryByText('Não foi possível carregar os dados para impressão.'),
    ).not.toBeInTheDocument()
  })

  it.each(['success', 'failure'] as const)(
    'ignores a previous print request with a late %s',
    async (outcome) => {
      let resolve!: (data: PrintData) => void
      let reject!: (reason: Error) => void
      mockGetClinicalRecordPrintData
        .mockReturnValueOnce(
          new Promise((yes, no) => {
            resolve = yes
            reject = no
          }),
        )
        .mockResolvedValueOnce(
          makePrintData({
            record: { ...makeRecord({ patientName: 'Bruno Silva' }), attachments: [] },
          }),
        )
      mockGetOdontogram.mockResolvedValueOnce(null)
      const view = render(<ClinicalRecordPrintContainer recordId="old" />)
      view.rerender(<ClinicalRecordPrintContainer recordId="current" />)
      await screen.findByRole('button', { name: /imprimir/i })
      await act(async () => {
        if (outcome === 'success') resolve(makePrintData())
        else reject(new Error('late failure'))
      })
      expect(screen.getAllByText('Bruno Silva')).toHaveLength(2)
      expect(screen.queryByText('Ana Martins')).not.toBeInTheDocument()
      expect(mockGetOdontogram).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('button', { name: /imprimir/i })).toBeEnabled()
    },
  )
})
