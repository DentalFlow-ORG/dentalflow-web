import { act, fireEvent, render, screen, waitFor, within } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

import type {
  ClinicalRecord,
  ClinicalTemplate,
} from '@/features/clinical-records/types/clinical-record.types'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockSave = vi.fn().mockResolvedValue(undefined)
const mockSaveQuiet = vi.fn().mockResolvedValue(undefined)
const mockSaveAndComplete = vi.fn().mockResolvedValue(undefined)
const mockLock = vi.fn().mockResolvedValue(undefined)
const mockCancel = vi.fn().mockResolvedValue(undefined)
const mockRestore = vi.fn().mockResolvedValue(undefined)

const mockUseClinicalRecord = vi.fn()
vi.mock('@/features/clinical-records/hooks/useClinicalRecord', () => ({
  useClinicalRecord: (...args: unknown[]) => mockUseClinicalRecord(...args),
}))

const mockUseClinicalTemplates = vi.fn()
vi.mock('@/features/clinical-records/hooks/useClinicalTemplates', () => ({
  useClinicalTemplates: () => mockUseClinicalTemplates(),
}))

const mockCancelPendingAutosave = vi.fn()
const mockWaitForAutosaveInFlight = vi.fn()
const mockUseClinicalRecordAutosave = vi.fn()
vi.mock('@/features/clinical-records/hooks/useClinicalRecordAutosave', () => ({
  useClinicalRecordAutosave: (...args: unknown[]) => mockUseClinicalRecordAutosave(...args),
}))

const mockProceed = vi.fn()
const mockReset = vi.fn()
const mockUseUnsavedChangesGuard = vi.fn()
vi.mock('@/features/clinical-records/hooks/useUnsavedChangesGuard', () => ({
  useUnsavedChangesGuard: (...args: unknown[]) => mockUseUnsavedChangesGuard(...args),
}))

const mockGetOdontogram = vi.fn()
const mockUpsertOdontogram = vi.fn()
vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  getOdontogram: (...args: unknown[]) => mockGetOdontogram(...args),
  upsertOdontogram: (...args: unknown[]) => mockUpsertOdontogram(...args),
}))

vi.mock('@/features/clinical-records/components/ClinicalRecordHeader', () => ({
  ClinicalRecordHeader: ({ record }: { record: ClinicalRecord }) => (
    <div data-testid="record-header">{record.patientName}</div>
  ),
}))

vi.mock('@/features/clinical-records/components/ClinicalStickyBar', () => ({
  ClinicalStickyBar: ({
    onSaveDraft,
    onComplete,
  }: {
    onSaveDraft: () => void
    onComplete: () => void
  }) => (
    <div data-testid="sticky-bar">
      <button type="button" onClick={onSaveDraft}>
        sticky-save
      </button>
      <button type="button" onClick={onComplete}>
        sticky-complete
      </button>
    </div>
  ),
}))

vi.mock('@/features/clinical-records/components/ClinicalRecordActions', () => ({
  ClinicalRecordActions: ({
    onSaveDraft,
    onComplete,
    onLock,
    onCancel,
    onRestore,
    onPrint,
  }: Record<string, () => void>) => (
    <div data-testid="record-actions">
      <button type="button" onClick={onSaveDraft}>
        actions-save
      </button>
      <button type="button" onClick={onComplete}>
        actions-complete
      </button>
      <button type="button" onClick={onLock}>
        actions-lock
      </button>
      <button type="button" onClick={onCancel}>
        actions-cancel
      </button>
      <button type="button" onClick={onRestore}>
        actions-restore
      </button>
      <button type="button" onClick={onPrint}>
        actions-print
      </button>
    </div>
  ),
}))

vi.mock('@/features/clinical-records/components/ClinicalSection', () => ({
  ClinicalSection: ({
    id,
    title,
    expanded,
    onToggle,
    children,
  }: {
    id: string
    title: string
    expanded: boolean
    onToggle: () => void
    children: React.ReactNode
  }) => (
    <div data-testid={`section-${id}`}>
      <button type="button" onClick={onToggle}>
        toggle-{title}
      </button>
      {expanded && <div data-testid={`section-body-${id}`}>{children}</div>}
    </div>
  ),
}))

vi.mock('@/features/clinical-records/components/ClinicalSectionField', () => ({
  ClinicalSectionField: ({
    label,
    hideLabel,
    value,
    onChange,
    readOnly,
  }: {
    label: string
    hideLabel?: boolean
    value: string
    onChange: (v: string) => void
    readOnly?: boolean
  }) => (
    <textarea
      aria-label={label}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      data-hidelabel={hideLabel ? 'true' : 'false'}
    />
  ),
}))

vi.mock('@/features/clinical-records/components/ClinicalTemplateSelectorPanel', () => ({
  ClinicalTemplateSelectorPanel: ({
    templates,
    onApply,
  }: {
    templates: ClinicalTemplate[]
    onApply: (t: ClinicalTemplate) => void
  }) => (
    <div data-testid="template-panel">
      {templates.map((t) => (
        <button key={t.id} type="button" onClick={() => onApply(t)}>
          apply-{t.name}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('@/features/clinical-records/components/ImageAttachmentPanel', () => ({
  ImageAttachmentPanel: () => <div data-testid="image-panel" />,
}))

vi.mock('@/features/clinical-records/components/OdontogramSection', () => ({
  OdontogramSection: ({
    data,
    onChange,
    readOnly,
  }: {
    data: { teeth: Record<string, unknown> }
    onChange: (data: { teeth: Record<string, unknown> }) => void
    readOnly?: boolean
  }) => (
    <div data-testid="odontogram-section" data-readonly={readOnly ? 'true' : 'false'}>
      <pre data-testid="chart-data">{JSON.stringify(data)}</pre>
      <button type="button" onClick={() => onChange({ teeth: { '11': { condition: 'caries' } } })}>
        mark-tooth
      </button>
      <button type="button" onClick={() => onChange({ teeth: { '21': { condition: 'caries' } } })}>
        mark-tooth-21
      </button>
    </div>
  ),
}))

vi.mock('@/features/clinical-records/components/PatientHistoryPanel', () => ({
  PatientHistoryPanel: () => <div data-testid="history-panel" />,
}))

const dictationSuggestions = vi.hoisted(() => ({
  value: [{ toothNumber: '21', condition: 'caries', note: 'nota' }],
  fields: { anamnesis: 'Ditado de anamnese' } as Record<string, string>,
}))
vi.mock('@/features/clinical-records/components/VoiceDictationCard', () => ({
  VoiceDictationCard: ({
    onApplyFields,
    onApplyOdontogram,
  }: {
    onApplyFields: (fields: Record<string, string>, modes?: Record<string, string>) => void
    onApplyOdontogram: (
      suggestions: { toothNumber: string; condition: string; note: string }[],
    ) => void
  }) => (
    <div data-testid="voice-dictation">
      <button type="button" onClick={() => onApplyFields(dictationSuggestions.fields)}>
        dictate-fields
      </button>
      <button type="button" onClick={() => onApplyOdontogram(dictationSuggestions.value)}>
        dictate-odontogram
      </button>
    </div>
  ),
}))

import { ClinicalRecordEditorContainer } from '@/features/clinical-records/containers/ClinicalRecordEditorContainer'

function makeRecord(overrides: Partial<ClinicalRecord> = {}): ClinicalRecord {
  return {
    id: 'rec-1',
    clinicId: 'clinic-1',
    appointmentId: null,
    profileId: 'prof-1',
    patientId: null,
    patientName: 'Ana Martins',
    patientEmail: 'ana@clinica.com',
    patientPhone: null,
    status: 'DRAFT',
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

function defaultRecordHookState(overrides: Partial<ReturnType<typeof baseState>> = {}) {
  return { ...baseState(), ...overrides }
}

function baseState() {
  return {
    record: makeRecord() as ClinicalRecord | null,
    isLoading: false,
    isSaving: false,
    error: null as string | null,
    save: mockSave,
    saveQuiet: mockSaveQuiet,
    saveAndComplete: mockSaveAndComplete,
    lock: mockLock,
    cancel: mockCancel,
    restore: mockRestore,
  }
}

describe('ClinicalRecordEditorContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dictationSuggestions.value = [{ toothNumber: '21', condition: 'caries', note: 'nota' }]
    dictationSuggestions.fields = { anamnesis: 'Ditado de anamnese' }
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState())
    mockUseClinicalTemplates.mockReturnValue({ templates: [] })
    mockWaitForAutosaveInFlight.mockResolvedValue(undefined)
    mockUseClinicalRecordAutosave.mockReturnValue({
      autosaveStatus: 'idle',
      autosaveError: null,
      cancelPendingAutosave: mockCancelPendingAutosave,
      waitForAutosaveInFlight: mockWaitForAutosaveInFlight,
    })
    mockUseUnsavedChangesGuard.mockReturnValue({
      isBlocked: false,
      proceed: mockProceed,
      reset: mockReset,
    })
    mockGetOdontogram.mockReset().mockResolvedValue(null)
    mockUpsertOdontogram.mockResolvedValue(undefined)
  })

  it('shows a loading indicator while the record loads', () => {
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState({ isLoading: true }))
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando prontuário...')
  })

  it.each([
    ['A', 'B'],
    ['B', 'A'],
  ])('never displays or saves %s chart under %s while loading', async (first, second) => {
    const firstRecord = makeRecord({ id: `record-${first}`, patientId: first })
    const secondRecord = makeRecord({ id: `record-${second}`, patientId: second })
    const chart = { teeth: { '11': { condition: 'caries', notes: first } } }
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState({ record: firstRecord }))
    mockGetOdontogram
      .mockResolvedValueOnce({ data: chart })
      .mockImplementationOnce(() => new Promise(() => {}))
    const { rerender } = render(<ClinicalRecordEditorContainer recordId={firstRecord.id} />)
    await act(async () => {})
    expect(screen.getByTestId('chart-data')).toHaveTextContent(first)
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState({ record: secondRecord }))
    rerender(<ClinicalRecordEditorContainer recordId={secondRecord.id} />)
    expect(screen.queryByTestId('chart-data')).not.toHaveTextContent(first)
    await act(async () => {
      fireEvent.click(screen.getByText('actions-save'))
    })
    expect(mockUpsertOdontogram).not.toHaveBeenCalledWith(
      secondRecord.patientEmail,
      secondRecord.patientName,
      chart,
      second,
    )
  })

  it.each([
    ['A', 'B'],
    ['B', 'A'],
  ])('discards late chart %s after switching to %s', async (first, second) => {
    let finish!: (value: unknown) => void
    const firstRecord = makeRecord({ id: `record-${first}`, patientId: first })
    const secondRecord = makeRecord({ id: `record-${second}`, patientId: second })
    const currentChart = { teeth: { '21': { condition: 'caries', notes: second } } }
    mockGetOdontogram
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finish = resolve
        }),
      )
      .mockResolvedValueOnce({ data: currentChart })
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState({ record: firstRecord }))
    const { rerender } = render(<ClinicalRecordEditorContainer recordId={firstRecord.id} />)
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState({ record: secondRecord }))
    rerender(<ClinicalRecordEditorContainer recordId={secondRecord.id} />)
    await act(async () => {})
    await act(async () => {
      finish({ data: { teeth: { '11': { condition: 'caries', notes: first } } } })
    })
    expect(screen.getByTestId('chart-data')).toHaveTextContent(second)
    expect(screen.getByTestId('chart-data')).not.toHaveTextContent(first)
    await act(async () => {
      fireEvent.click(screen.getByText('mark-tooth-21'))
    })
    await act(async () => {
      fireEvent.click(screen.getByText('actions-save'))
    })
    expect(mockUpsertOdontogram).toHaveBeenCalledExactlyOnceWith(
      secondRecord.patientEmail,
      secondRecord.patientName,
      { teeth: { '21': { condition: 'caries' } } },
      second,
    )
  })

  it.each([new Error('offline'), 'offline'])(
    'keeps the chart read-only and permits retry after load failure: %s',
    async (error) => {
      mockGetOdontogram
        .mockReset()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ data: { teeth: { '11': { condition: 'caries' } } } })
      render(<ClinicalRecordEditorContainer recordId="rec-1" />)

      const alert = await screen.findByText(/Não foi possível carregar o odontograma/)
      expect(screen.getByTestId('odontogram-section')).toHaveAttribute('data-readonly', 'true')

      await userEvent.click(
        within(alert.closest('[role="alert"]') as HTMLElement).getByRole('button', {
          name: 'Tentar novamente',
        }),
      )
      await waitFor(() =>
        expect(screen.getByTestId('odontogram-section')).toHaveAttribute('data-readonly', 'false'),
      )
      expect(screen.queryByText(/Não foi possível carregar o odontograma/)).not.toBeInTheDocument()
      expect(mockGetOdontogram).toHaveBeenCalledTimes(2)
    },
  )

  it.each([
    ['A', 'B'],
    ['B', 'A'],
  ])('ignores a late load failure for %s after %s has loaded', async (first, second) => {
    let reject!: (error: unknown) => void
    const firstRecord = makeRecord({ id: `record-${first}`, patientId: first })
    const secondRecord = makeRecord({ id: `record-${second}`, patientId: second })
    mockGetOdontogram
      .mockReturnValueOnce(
        new Promise((_resolve, fail) => {
          reject = fail
        }),
      )
      .mockResolvedValueOnce({ data: { teeth: { '21': { condition: 'caries', notes: second } } } })
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState({ record: firstRecord }))
    const { rerender } = render(<ClinicalRecordEditorContainer recordId={firstRecord.id} />)
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState({ record: secondRecord }))
    rerender(<ClinicalRecordEditorContainer recordId={secondRecord.id} />)
    await act(async () => {})
    await act(async () => reject(new Error('Late failure')))
    expect(screen.getByTestId('chart-data')).toHaveTextContent(second)
    expect(screen.getByTestId('odontogram-section')).toHaveAttribute('data-readonly', 'false')
    expect(screen.queryByText(/Não foi possível carregar o odontograma/)).not.toBeInTheDocument()
  })

  it('marks odontogram edits as unsaved after a failed save and clears it on retry', async () => {
    mockUpsertOdontogram
      .mockReset()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined)
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await act(async () => {})
    await act(async () => {
      fireEvent.click(screen.getByText('mark-tooth'))
    })
    // The pending edit already counts as unsaved for the navigation guard.
    expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith({ isDirty: true })

    await act(async () => {
      fireEvent.click(screen.getByText('actions-save'))
    })
    expect(await screen.findByText('Alterações do odontograma não salvas.')).toBeInTheDocument()
    expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith({ isDirty: true })

    await userEvent.click(screen.getByRole('button', { name: 'Tentar salvar novamente' }))
    await waitFor(() =>
      expect(screen.queryByText('Alterações do odontograma não salvas.')).not.toBeInTheDocument(),
    )
    expect(mockUpsertOdontogram).toHaveBeenCalledTimes(2)
    expect(mockUseUnsavedChangesGuard).toHaveBeenLastCalledWith({ isDirty: false })
  })

  it('shows an error message', () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ error: 'Falha ao carregar prontuário' }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText('Falha ao carregar prontuário')).toBeInTheDocument()
  })

  it('shows a not-found empty state when there is no record', () => {
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState({ record: null }))
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText('Prontuário não encontrado')).toBeInTheDocument()
  })

  it('renders the header and sticky bar once a record loads', () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByTestId('record-header')).toHaveTextContent('Ana Martins')
    expect(screen.getByTestId('sticky-bar')).toBeInTheDocument()
  })

  it('shows no read-only notice for a DRAFT record', () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.queryByText(/bloqueado permanentemente/)).not.toBeInTheDocument()
    expect(screen.queryByText(/cancelado/i)).not.toBeInTheDocument()
  })

  it('shows the LOCKED read-only notice', () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ status: 'LOCKED' }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText(/bloqueado permanentemente/)).toBeInTheDocument()
  })

  it('shows the CANCELED read-only notice', () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ status: 'CANCELED' }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText(/prontuário cancelado/i)).toBeInTheDocument()
  })

  it('shows the COMPLETED read-only notice', () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ status: 'COMPLETED' }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText(/modo somente leitura/i)).toBeInTheDocument()
  })

  it('does not render the sidebar (templates/dictation) when the record is not editable', () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ status: 'LOCKED' }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.queryByTestId('template-panel')).not.toBeInTheDocument()
    expect(screen.queryByTestId('voice-dictation')).not.toBeInTheDocument()
  })

  it('hides the private-notes section in read-only mode with no existing content', () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ status: 'LOCKED', privateNotes: null }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.queryByTestId('section-notas-privadas')).not.toBeInTheDocument()
  })

  it('shows the private-notes section in read-only mode when content exists', () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({
        record: makeRecord({ status: 'LOCKED', privateNotes: 'Nota interna' }),
      }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByTestId('section-notas-privadas')).toBeInTheDocument()
  })

  it('calls save via the sticky bar "save" action', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'sticky-save' }))
    expect(mockCancelPendingAutosave).toHaveBeenCalled()
    expect(mockSave).toHaveBeenCalledWith({})
  })

  it('asks for confirmation, naming the patient, before completing from the sticky bar', async () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ clinicalEvolution: 'Evolução registrada' }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'sticky-complete' }))
    const dialog = screen.getByRole('dialog', { name: 'Concluir atendimento' })
    expect(dialog).toHaveTextContent('Ana Martins')
    expect(dialog).toHaveTextContent('somente leitura em definitivo')
    expect(dialog).toHaveTextContent('não poderá mais ser editado')
    expect(dialog).not.toHaveTextContent('restaurar')
    expect(mockSaveAndComplete).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Concluir atendimento' }))
    expect(mockSaveAndComplete).toHaveBeenCalledWith({})
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not complete when the confirmation is cancelled', async () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ clinicalEvolution: 'Evolução registrada' }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'actions-complete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Continuar editando' }))
    expect(mockSaveAndComplete).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it.each([
    ['empty', ''],
    ['whitespace-only', '   '],
  ])('blocks completing with an %s clinical evolution', async (_case, evolution) => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ clinicalEvolution: evolution }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'sticky-complete' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockSaveAndComplete).not.toHaveBeenCalled()
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Evolução clínica obrigatória', tone: 'warning' }),
    )
    expect(screen.getByTestId('section-body-evolucao')).toBeInTheDocument()
  })

  it('accepts an evolution typed in the unsaved draft when completing', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.type(screen.getByLabelText('Evolução clínica'), 'Sem intercorrências')
    await userEvent.click(screen.getByRole('button', { name: 'sticky-complete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Concluir atendimento' }))
    expect(mockSaveAndComplete).toHaveBeenCalledWith({ clinicalEvolution: 'Sem intercorrências' })
  })

  it('stops autosave and waits for an in-flight save before completing (race regression)', async () => {
    const order: string[] = []
    let finishAutosave!: () => void
    mockCancelPendingAutosave.mockImplementation(() => order.push('cancel-autosave'))
    mockWaitForAutosaveInFlight.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishAutosave = () => {
            order.push('autosave-settled')
            resolve()
          }
        }),
    )
    mockSaveAndComplete.mockImplementation(async () => {
      order.push('complete')
    })
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ clinicalEvolution: 'Evolução registrada' }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'sticky-complete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Concluir atendimento' }))
    expect(mockSaveAndComplete).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /aguarde/i })).toBeDisabled()
    await act(async () => finishAutosave())
    expect(order).toEqual(['cancel-autosave', 'autosave-settled', 'complete'])
  })

  it('persists a pending odontogram edit before completing', async () => {
    const order: string[] = []
    mockUpsertOdontogram.mockImplementation(async () => {
      order.push('odontogram')
    })
    mockSaveAndComplete.mockImplementation(async () => {
      order.push('complete')
    })
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ clinicalEvolution: 'Evolução registrada' }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await act(async () => {})
    await userEvent.click(screen.getByRole('button', { name: 'mark-tooth' }))
    await userEvent.click(screen.getByRole('button', { name: 'sticky-complete' }))
    await userEvent.click(screen.getByRole('button', { name: 'Concluir atendimento' }))
    expect(order).toEqual(['odontogram', 'complete'])
  })

  it('calls lock/cancel/restore/print from the action bar', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'actions-lock' }))
    expect(mockLock).toHaveBeenCalledOnce()
    await userEvent.click(screen.getByRole('button', { name: 'actions-cancel' }))
    expect(mockCancel).toHaveBeenCalledOnce()
    await userEvent.click(screen.getByRole('button', { name: 'actions-restore' }))
    expect(mockRestore).toHaveBeenCalledOnce()
    await userEvent.click(screen.getByRole('button', { name: 'actions-print' }))
  })

  it('toggles a section open and closed', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    // 'anamnese' starts closed under DRAFT defaults
    expect(screen.queryByTestId('section-body-anamnese')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /toggle-anamnese/i }))
    expect(screen.getByTestId('section-body-anamnese')).toBeInTheDocument()
  })

  it('updates a field value via ClinicalSectionField onChange', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    const field = screen.getByLabelText('Queixa principal')
    await userEvent.type(field, 'Dor')
    expect(field).toHaveValue('Dor')
  })

  it.each([
    ['evolucao', 'Evolução clínica'],
    ['diagnostico', 'Diagnóstico'],
    ['plano', 'Plano clínico'],
    ['odontograma', 'Odontograma'],
    ['imagens', 'Imagens e anexos'],
    ['notas-privadas', 'Notas privadas (não imprimíveis)'],
  ])('collapses and reopens the %s section without losing its contents', async (id, title) => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    const toggle = screen.getByRole('button', { name: `toggle-${title}` })
    const wasOpen = screen.queryByTestId(`section-body-${id}`) !== null
    await userEvent.click(toggle)
    expect(screen.queryByTestId(`section-body-${id}`) !== null).toBe(!wasOpen)
    await userEvent.click(toggle)
    expect(screen.queryByTestId(`section-body-${id}`) !== null).toBe(wasOpen)
  })

  it('applies a matching template and opens the target section', async () => {
    const template: ClinicalTemplate = {
      id: 'tpl-1',
      clinicId: 'clinic-1',
      name: 'Modelo Anamnese',
      category: 'ANAMNESIS',
      content: 'Conteúdo do modelo',
      isActive: true,
      createdByUserId: 'user-1',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    } as ClinicalTemplate
    mockUseClinicalTemplates.mockReturnValue({ templates: [template] })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)

    await userEvent.click(screen.getByRole('button', { name: /apply-modelo anamnese/i }))
    expect(screen.getByTestId('section-body-anamnese')).toBeInTheDocument()
    expect(screen.getByLabelText('Anamnese')).toHaveValue('Conteúdo do modelo')
  })

  it('appends template content to existing text with a blank-line separator', async () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ anamnesis: 'Texto existente' }) }),
    )
    const template: ClinicalTemplate = {
      id: 'tpl-1',
      clinicId: 'clinic-1',
      name: 'Modelo',
      category: 'ANAMNESIS',
      content: 'Novo texto',
      isActive: true,
      createdByUserId: 'user-1',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    } as ClinicalTemplate
    mockUseClinicalTemplates.mockReturnValue({ templates: [template] })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)

    await userEvent.click(screen.getByRole('button', { name: /apply-modelo/i }))
    expect(screen.getByLabelText('Anamnese')).toHaveValue('Texto existente\n\nNovo texto')
  })

  it('refuses a template that would push a field past its limit, keeping the existing text', async () => {
    const existing = 'a'.repeat(9_990)
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ anamnesis: existing }) }),
    )
    const template = {
      id: 'tpl-long',
      clinicId: 'clinic-1',
      name: 'Longo',
      category: 'ANAMNESIS',
      content: 'Texto do modelo com mais de dez caracteres',
      isActive: true,
      createdByUserId: 'user-1',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    } as ClinicalTemplate
    mockUseClinicalTemplates.mockReturnValue({ templates: [template] })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: /apply-longo/i }))
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Modelo não aplicado',
        description: expect.stringContaining('"Anamnese" ultrapassaria o limite de 10.000'),
      }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'toggle-Anamnese' }))
    expect(screen.getByLabelText('Anamnese')).toHaveValue(existing)
  })

  it('applies a template that lands exactly on the field limit', async () => {
    const content = 'b'.repeat(10_000)
    const template = {
      id: 'tpl-max',
      clinicId: 'clinic-1',
      name: 'Limite',
      category: 'ANAMNESIS',
      content,
      isActive: true,
      createdByUserId: 'user-1',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
    } as ClinicalTemplate
    mockUseClinicalTemplates.mockReturnValue({ templates: [template] })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: /apply-limite/i }))
    expect(screen.getByLabelText('Anamnese')).toHaveValue(content)
    expect(mockShowAlert).not.toHaveBeenCalled()
  })

  it('refuses dictation that would exceed the 500-character chief complaint limit', async () => {
    dictationSuggestions.fields = { chiefComplaint: 'c'.repeat(501) }
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'dictate-fields' }))
    expect(screen.getByLabelText('Queixa principal')).toHaveValue('')
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ditado não aplicado',
        description: expect.stringContaining('"Queixa principal"'),
      }),
    )
  })

  it('applies dictation-suggested field text', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'dictate-fields' }))
    expect(screen.getByLabelText('Anamnese')).toHaveValue('Ditado de anamnese')
  })

  it('applies a dictated chief complaint without opening unrelated sections', async () => {
    dictationSuggestions.fields = { chiefComplaint: 'Dor ao mastigar' }
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'dictate-fields' }))
    expect(screen.getByLabelText('Queixa principal')).toHaveValue('Dor ao mastigar')
    expect(screen.queryByTestId('section-body-anamnese')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'sticky-save' }))
    expect(mockSave).toHaveBeenCalledWith({ chiefComplaint: 'Dor ao mastigar' })
  })

  it('applies dictation odontogram suggestions and opens the odontogram section', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'dictate-odontogram' }))
    expect(screen.getByTestId('section-body-odontograma')).toBeInTheDocument()
    // Odontogram persistence is debounced.
    await vi.waitFor(() => expect(mockUpsertOdontogram).toHaveBeenCalled(), { timeout: 2000 })
  })

  it('warns and skips a tooth that already has a non-healthy condition from dictation', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    // Mark tooth 21 as caries first (dictate-odontogram also suggests tooth 21).
    await userEvent.click(screen.getByRole('button', { name: 'mark-tooth-21' }))
    // Let the debounced save of that manual edit finish first.
    await vi.waitFor(() => expect(mockUpsertOdontogram).toHaveBeenCalled(), { timeout: 2000 })
    mockShowAlert.mockClear()
    mockUpsertOdontogram.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'dictate-odontogram' }))

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Dentes não aplicados' }),
    )
    // Every suggested tooth was skipped, so no further odontogram save is queued.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 900))
    })
    expect(mockUpsertOdontogram).not.toHaveBeenCalled()
  })

  it('shows a warning alert when saving the odontogram fails', async () => {
    mockUpsertOdontogram.mockRejectedValue(new Error('network'))
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'mark-tooth' }))
    await vi.waitFor(() => expect(mockShowAlert).toHaveBeenCalled(), { timeout: 2000 })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Odontograma não salvo' }),
    )
  })

  it('preserves existing conditions while applying the remaining dictated teeth without notes', async () => {
    const teeth = { '11': { condition: 'caries' }, '21': { condition: 'restoration' } }
    mockGetOdontogram.mockResolvedValue({ data: { teeth } })
    dictationSuggestions.value = [
      { toothNumber: '11', condition: 'missing', note: '' },
      { toothNumber: '21', condition: 'missing', note: '' },
      { toothNumber: '22', condition: 'caries', note: '' },
    ]
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await act(async () => {})
    await userEvent.click(screen.getByRole('button', { name: 'dictate-odontogram' }))
    await vi.waitFor(
      () =>
        expect(mockUpsertOdontogram).toHaveBeenCalledWith(
          'ana@clinica.com',
          'Ana Martins',
          { teeth: { ...teeth, '22': { condition: 'caries', notes: undefined } } },
          null,
        ),
      { timeout: 2000 },
    )
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Não aplicado: dentes 11, 21 já possuem condição registrada.',
      }),
    )
  })

  it('shows the unsaved-changes confirm dialog when blocked, and wires proceed/cancel', async () => {
    mockUseUnsavedChangesGuard.mockReturnValue({
      isBlocked: true,
      proceed: mockProceed,
      reset: mockReset,
    })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText('Sair sem salvar?')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sair sem salvar' }))
    expect(mockProceed).toHaveBeenCalledOnce()
  })

  it('shows the autosave status indicator text', () => {
    mockUseClinicalRecordAutosave.mockReturnValue({
      autosaveStatus: 'saved',
      cancelPendingAutosave: mockCancelPendingAutosave,
    })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText('Salvo automaticamente')).toBeInTheDocument()
  })

  it('shows the autosave error indicator text', () => {
    mockUseClinicalRecordAutosave.mockReturnValue({
      autosaveStatus: 'error',
      cancelPendingAutosave: mockCancelPendingAutosave,
    })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText(/falha ao salvar/i)).toBeInTheDocument()
  })

  it('shows the API validation message when autosave is rejected', () => {
    mockUseClinicalRecordAutosave.mockReturnValue({
      autosaveStatus: 'error',
      autosaveError: 'Queixa principal deve ter no máximo 500 caracteres.',
      cancelPendingAutosave: mockCancelPendingAutosave,
      waitForAutosaveInFlight: mockWaitForAutosaveInFlight,
    })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(
      screen.getByText('Falha ao salvar: Queixa principal deve ter no máximo 500 caracteres.'),
    ).toBeInTheDocument()
  })

  it('shows the autosave "pending" indicator text', () => {
    mockUseClinicalRecordAutosave.mockReturnValue({
      autosaveStatus: 'pending',
      cancelPendingAutosave: mockCancelPendingAutosave,
    })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText('Aguardando para salvar...')).toBeInTheDocument()
  })

  it('shows the autosave "saving" indicator text', () => {
    mockUseClinicalRecordAutosave.mockReturnValue({
      autosaveStatus: 'saving',
      cancelPendingAutosave: mockCancelPendingAutosave,
    })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByText('Salvando...')).toBeInTheDocument()
  })

  it('resolves the odontogram identifier by patientName when there is no email', () => {
    mockUseClinicalRecord.mockReturnValue(
      defaultRecordHookState({ record: makeRecord({ patientEmail: null }) }),
    )
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(mockGetOdontogram).toHaveBeenCalledWith('Ana Martins', null)
  })

  it('saves a pending odontogram edit with the draft and retries it after a failure', async () => {
    mockGetOdontogram.mockResolvedValue({ data: { teeth: { '21': { condition: 'restoration' } } } })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await act(async () => {})
    mockUpsertOdontogram.mockRejectedValueOnce(new Error('offline'))
    await userEvent.click(screen.getByRole('button', { name: 'mark-tooth' }))
    await userEvent.click(screen.getByRole('button', { name: 'sticky-save' }))
    const edited = { teeth: { '11': { condition: 'caries' } } }
    expect(mockSave).toHaveBeenCalledWith({})
    expect(mockUpsertOdontogram).toHaveBeenCalledWith(
      'ana@clinica.com',
      'Ana Martins',
      edited,
      null,
    )
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Odontograma não salvo' }),
    )
    // The failed chart stays queued and is retried by the next save.
    await userEvent.click(screen.getByRole('button', { name: 'sticky-save' }))
    expect(mockUpsertOdontogram).toHaveBeenCalledTimes(2)
    expect(mockUpsertOdontogram).toHaveBeenLastCalledWith(
      'ana@clinica.com',
      'Ana Martins',
      edited,
      null,
    )
    expect(mockShowAlert).toHaveBeenCalledTimes(1)
  })

  it('does not re-send an unchanged odontogram when saving a draft', async () => {
    mockGetOdontogram.mockResolvedValue({ data: { teeth: { '11': { condition: 'caries' } } } })
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await act(async () => {})
    await userEvent.click(screen.getByRole('button', { name: 'sticky-save' }))
    expect(mockUpsertOdontogram).not.toHaveBeenCalled()
  })

  it('collapses rapid odontogram edits into a single save of the latest chart', async () => {
    vi.useFakeTimers()
    try {
      render(<ClinicalRecordEditorContainer recordId="rec-1" />)
      await act(async () => {})
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'mark-tooth' }))
      })
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'mark-tooth-21' }))
      })
      expect(mockUpsertOdontogram).not.toHaveBeenCalled()
      await act(async () => {
        vi.advanceTimersByTime(800)
      })
      expect(mockUpsertOdontogram).toHaveBeenCalledExactlyOnceWith(
        'ana@clinica.com',
        'Ana Martins',
        { teeth: { '21': { condition: 'caries' } } },
        null,
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps the editor usable when the optional odontogram cannot load', async () => {
    mockGetOdontogram.mockRejectedValue(new Error('offline'))
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.type(screen.getByLabelText('Queixa principal'), 'Dor')
    await userEvent.click(screen.getByRole('button', { name: 'sticky-save' }))
    expect(mockSave).toHaveBeenCalledWith({ chiefComplaint: 'Dor' })
    expect(mockUpsertOdontogram).not.toHaveBeenCalled()
  })

  it('ignores an odontogram load that completes after leaving the editor', async () => {
    let resolve!: (value: unknown) => void
    mockGetOdontogram.mockReturnValue(
      new Promise((done) => {
        resolve = done
      }),
    )
    const { unmount } = render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    unmount()
    await act(async () => {
      resolve({ data: { teeth: { '11': { condition: 'caries' } } } })
    })
    expect(mockUpsertOdontogram).not.toHaveBeenCalled()
    expect(mockShowAlert).not.toHaveBeenCalled()
  })

  it('limits repeated odontogram failure alerts and allows another warning after ten seconds', async () => {
    vi.useFakeTimers()
    try {
      mockUpsertOdontogram.mockRejectedValue(new Error('offline'))
      const { unmount } = render(<ClinicalRecordEditorContainer recordId="rec-1" />)
      await act(async () => {})
      const markAndSettle = async (name: string) => {
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name }))
        })
        await act(async () => {
          vi.advanceTimersByTime(800)
        })
      }
      await markAndSettle('mark-tooth')
      await markAndSettle('mark-tooth-21')
      expect(mockShowAlert).toHaveBeenCalledTimes(1)
      await act(async () => {
        vi.advanceTimersByTime(10_000)
      })
      await markAndSettle('mark-tooth')
      expect(mockShowAlert).toHaveBeenCalledTimes(2)
      expect(mockUpsertOdontogram).toHaveBeenCalledTimes(3)
      unmount()
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
  // ── Record-lock guards ──────────────────────────────────────────────────────
  // A record that is no longer a DRAFT must not be mutable. The action bar and
  // the odontogram still render for a locked record (so the user can print or
  // read it), so their handlers are the last line of defence and must no-op.
  describe('record-lock guards', () => {
    for (const status of ['COMPLETED', 'LOCKED', 'CANCELED'] as const) {
      it(`does not save a draft from the action bar for a ${status} record`, async () => {
        mockUseClinicalRecord.mockReturnValue(
          defaultRecordHookState({ record: makeRecord({ status }) }),
        )
        render(<ClinicalRecordEditorContainer recordId="rec-1" />)
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: 'actions-save' }))
        })
        expect(mockSave).not.toHaveBeenCalled()
        expect(mockCancelPendingAutosave).not.toHaveBeenCalled()
        expect(mockUpsertOdontogram).not.toHaveBeenCalled()
      })

      it(`does not persist odontogram changes for a ${status} record`, async () => {
        mockUseClinicalRecord.mockReturnValue(
          defaultRecordHookState({ record: makeRecord({ status }) }),
        )
        render(<ClinicalRecordEditorContainer recordId="rec-1" />)
        await act(async () => {
          fireEvent.click(screen.getByRole('button', { name: 'mark-tooth' }))
        })
        expect(mockUpsertOdontogram).not.toHaveBeenCalled()
        expect(mockShowAlert).not.toHaveBeenCalled()
      })
    }

    it('hides the template and dictation tools for a locked record', () => {
      mockUseClinicalRecord.mockReturnValue(
        defaultRecordHookState({ record: makeRecord({ status: 'LOCKED' }) }),
      )
      render(<ClinicalRecordEditorContainer recordId="rec-1" />)
      expect(screen.queryByTestId('template-panel')).not.toBeInTheDocument()
      expect(screen.queryByTestId('voice-dictation')).not.toBeInTheDocument()
    })

    it('still saves a draft from the action bar for a DRAFT record', async () => {
      render(<ClinicalRecordEditorContainer recordId="rec-1" />)
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'actions-save' }))
      })
      expect(mockSave).toHaveBeenCalledTimes(1)
    })
  })
})
