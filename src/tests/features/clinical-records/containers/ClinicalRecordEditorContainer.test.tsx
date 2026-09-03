import { render, screen } from '@/test-utils/render-utils'
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
    onChange,
  }: {
    onChange: (data: { teeth: Record<string, unknown> }) => void
  }) => (
    <div data-testid="odontogram-section">
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
      <button type="button" onClick={() => onApplyFields({ anamnesis: 'Ditado de anamnese' })}>
        dictate-fields
      </button>
      <button
        type="button"
        onClick={() =>
          onApplyOdontogram([{ toothNumber: '21', condition: 'caries', note: 'nota' }])
        }
      >
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
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState())
    mockUseClinicalTemplates.mockReturnValue({ templates: [] })
    mockUseClinicalRecordAutosave.mockReturnValue({
      autosaveStatus: 'idle',
      cancelPendingAutosave: mockCancelPendingAutosave,
    })
    mockUseUnsavedChangesGuard.mockReturnValue({
      isBlocked: false,
      proceed: mockProceed,
      reset: mockReset,
    })
    mockGetOdontogram.mockResolvedValue(null)
    mockUpsertOdontogram.mockResolvedValue(undefined)
  })

  it('shows a loading indicator while the record loads', () => {
    mockUseClinicalRecord.mockReturnValue(defaultRecordHookState({ isLoading: true }))
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando prontuário...')
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

  it('calls saveAndComplete via the sticky bar "complete" action', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'sticky-complete' }))
    expect(mockSaveAndComplete).toHaveBeenCalledWith({})
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

  it('applies dictation-suggested field text', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'dictate-fields' }))
    expect(screen.getByLabelText('Anamnese')).toHaveValue('Ditado de anamnese')
  })

  it('applies dictation odontogram suggestions and opens the odontogram section', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'dictate-odontogram' }))
    expect(screen.getByTestId('section-body-odontograma')).toBeInTheDocument()
    expect(mockUpsertOdontogram).toHaveBeenCalled()
  })

  it('warns and skips a tooth that already has a non-healthy condition from dictation', async () => {
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    // Mark tooth 21 as caries first (dictate-odontogram also suggests tooth 21).
    await userEvent.click(screen.getByRole('button', { name: 'mark-tooth-21' }))
    mockShowAlert.mockClear()
    mockUpsertOdontogram.mockClear()

    await userEvent.click(screen.getByRole('button', { name: 'dictate-odontogram' }))

    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Dentes não aplicados' }),
    )
    // Every suggested tooth was skipped, so the odontogram is not re-saved.
    expect(mockUpsertOdontogram).not.toHaveBeenCalled()
  })

  it('shows a warning alert when saving the odontogram fails', async () => {
    mockUpsertOdontogram.mockRejectedValue(new Error('network'))
    render(<ClinicalRecordEditorContainer recordId="rec-1" />)
    await userEvent.click(screen.getByRole('button', { name: 'mark-tooth' }))
    await vi.waitFor(() => expect(mockShowAlert).toHaveBeenCalled())
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Odontograma não salvo' }),
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
    expect(mockGetOdontogram).toHaveBeenCalledWith('Ana Martins')
  })
})
