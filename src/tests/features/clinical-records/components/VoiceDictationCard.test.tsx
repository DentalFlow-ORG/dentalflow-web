import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceDictationCard } from '@/features/clinical-records/components/VoiceDictationCard'
import type { ClinicalDictationFieldKey } from '@/features/clinical-records/types/clinical-dictation.types'

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockGetBillingStatus = vi.fn()
vi.mock('@/features/billing/services/billing-status-cache', () => ({
  getCachedBillingStatus: () => mockGetBillingStatus(),
}))

const mockDictateClinicalRecord = vi.fn()
vi.mock('@/features/clinical-records/services/clinical-dictation.service', () => ({
  dictateClinicalRecord: (...args: unknown[]) => mockDictateClinicalRecord(...args),
}))

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert, dismissAlert: vi.fn() }),
}))

// ── Fake MediaRecorder ────────────────────────────────────────────────────────

class FakeMediaRecorder {
  state: 'inactive' | 'recording' = 'inactive'
  ondataavailable: ((e: { data: Blob; size: number }) => void) | null = null
  onstop: (() => void) | null = null

  static isTypeSupported = vi.fn(() => true)

  start = vi.fn(() => { this.state = 'recording' })

  stop = vi.fn(() => {
    if (this.state !== 'recording') return
    this.state = 'inactive'
    const blob = new Blob(['fake-audio'], { type: 'audio/webm' })
    this.ondataavailable?.({ data: blob, size: blob.size })
    this.onstop?.()
  })
}

// ── Fake FileReader ───────────────────────────────────────────────────────────

class FakeFileReader {
  result = 'data:audio/webm;base64,ZmFrZQ=='
  onloadend: (() => void) | null = null
  onerror: (() => void) | null = null
  readAsDataURL(_blob: Blob) {
    queueMicrotask(() => this.onloadend?.())
  }
}

// ── getUserMedia mock ─────────────────────────────────────────────────────────

const mockGetUserMedia = vi.fn()

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeAll(() => {
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
  vi.stubGlobal('FileReader', FakeFileReader)
  // jsdom does not implement navigator.mediaDevices — add it once
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    configurable: true,
    writable: true,
  })
})

afterAll(() => {
  vi.unstubAllGlobals()
})

beforeEach(() => {
  vi.clearAllMocks()

  mockGetBillingStatus.mockReturnValue({ planKey: 'premium', accessAllowed: true })
  mockDictateClinicalRecord.mockResolvedValue({
    transcript: 'Paciente relata dor no dente 36.',
    fields: { chiefComplaint: 'Dor no dente 36', clinicalEvolution: 'Sensibilidade ao frio.' },
  })
  mockGetUserMedia.mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }],
  } as unknown as MediaStream)
  // Refresh the fn reference after clearAllMocks (double-cast needed because
  // jsdom's MediaDevices type doesn't overlap with the mock shape)
  ;(navigator.mediaDevices as unknown as { getUserMedia: typeof mockGetUserMedia }).getUserMedia =
    mockGetUserMedia
})

// ── Fixtures ──────────────────────────────────────────────────────────────────

const RECORD_ID = 'rec-abc'

function renderCard(
  props: Partial<{
    recordId: string
    readOnly: boolean
    onApplyFields: (fields: Partial<Record<ClinicalDictationFieldKey, string>>) => void
  }> = {},
) {
  const onApplyFields = props.onApplyFields ?? vi.fn()
  const { unmount } = render(
    <VoiceDictationCard
      recordId={RECORD_ID}
      readOnly={false}
      onApplyFields={onApplyFields}
      {...props}
    />,
  )
  return { onApplyFields, unmount }
}

// Helper — walks through the full recording flow to reach the success state.
// getUserMedia is async, so every state transition needs waitFor.
async function reachSuccessState(onApplyFields = vi.fn()) {
  const user = userEvent.setup()
  renderCard({ onApplyFields })

  await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
  await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

  await user.click(screen.getByRole('button', { name: /Parar gravação/i }))
  await waitFor(
    () => expect(screen.getByText(/Transcrição/i)).toBeInTheDocument(),
    { timeout: 3000 },
  )
}

// ── 1. Premium gate ───────────────────────────────────────────────────────────

describe('premium gate', () => {
  it('shows locked state and upgrade link for starter plan', () => {
    mockGetBillingStatus.mockReturnValue({ planKey: 'starter' })
    renderCard()
    expect(screen.getByText(/plano Premium/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Gravar consulta/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver planos/i })).toBeInTheDocument()
  })

  it('shows locked state for professional plan', () => {
    mockGetBillingStatus.mockReturnValue({ planKey: 'professional' })
    renderCard()
    expect(screen.queryByRole('button', { name: /Gravar consulta/i })).not.toBeInTheDocument()
  })

  it('shows recording UI for premium plan', () => {
    renderCard()
    expect(screen.getByRole('button', { name: /Gravar consulta/i })).toBeInTheDocument()
  })

  it('shows recording UI when planKey is null (admin / cache miss — fail open)', () => {
    mockGetBillingStatus.mockReturnValue(null)
    renderCard()
    expect(screen.getByRole('button', { name: /Gravar consulta/i })).toBeInTheDocument()
  })
})

// ── 2. Read-only state ────────────────────────────────────────────────────────

describe('read-only state', () => {
  it('shows an explanatory notice and no record button when readOnly is true', () => {
    renderCard({ readOnly: true })
    expect(screen.getByText(/apenas em prontuários em rascunho/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Gravar consulta/i })).not.toBeInTheDocument()
  })
})

// ── 3. Unsupported browser ────────────────────────────────────────────────────

describe('unsupported browser', () => {
  it('shows an error when MediaRecorder is not available', async () => {
    vi.stubGlobal('MediaRecorder', undefined)
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))

    // When navigator.mediaDevices exists but MediaRecorder is undefined the
    // component shows: "Gravação de áudio não é suportada neste navegador."
    await waitFor(() => {
      expect(screen.getByText(/Gravação de áudio não é suportada/i)).toBeInTheDocument()
    })
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'error' }))

    vi.stubGlobal('MediaRecorder', FakeMediaRecorder) // restore for subsequent tests
  })
})

// ── 4 & 5. Successful recording flow ─────────────────────────────────────────

describe('successful recording flow', () => {
  it('calls dictateClinicalRecord with the record id and audio payload', async () => {
    await reachSuccessState()
    expect(mockDictateClinicalRecord).toHaveBeenCalledWith(
      RECORD_ID,
      expect.objectContaining({
        audioBase64: expect.any(String),
        mimeType: expect.any(String),
        durationSeconds: expect.any(Number),
      }),
    )
  })

  it('renders the transcript and classified field suggestions', async () => {
    await reachSuccessState()
    expect(screen.getByText('Paciente relata dor no dente 36.')).toBeInTheDocument()
    expect(screen.getByText('Queixa principal')).toBeInTheDocument()
    expect(screen.getByText('Evolução clínica')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Aplicar aos campos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Descartar/i })).toBeInTheDocument()
  })

  it('shows empty-fields notice and no Apply button when no fields were classified', async () => {
    mockDictateClinicalRecord.mockResolvedValue({ transcript: 'Sem campos.', fields: {} })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(() =>
      expect(screen.getByText(/nenhum campo clínico foi identificado/i)).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: /Aplicar aos campos/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Descartar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Gravar novamente/i })).toBeInTheDocument()
  })
})

// ── 6. Apply action ───────────────────────────────────────────────────────────

describe('apply action', () => {
  it('calls onApplyFields with the classified fields and resets to idle', async () => {
    const onApplyFields = vi.fn()
    await reachSuccessState(onApplyFields)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Aplicar aos campos/i }))

    expect(onApplyFields).toHaveBeenCalledWith({
      chiefComplaint: 'Dor no dente 36',
      clinicalEvolution: 'Sensibilidade ao frio.',
    })
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Gravar consulta/i })).toBeInTheDocument(),
    )
  })
})

// ── 7. Discard action ─────────────────────────────────────────────────────────

describe('discard action', () => {
  it('clears transcript and suggestions and returns to idle', async () => {
    await reachSuccessState()

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Descartar/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Gravar consulta/i })).toBeInTheDocument(),
    )
    expect(screen.queryByText(/Transcrição/i)).not.toBeInTheDocument()
  })
})

// ── 8. Error handling ─────────────────────────────────────────────────────────

describe('error handling', () => {
  it('shows an error state and alert when the service rejects', async () => {
    mockDictateClinicalRecord.mockRejectedValue(new Error('Serviço indisponível'))
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(() =>
      expect(screen.getByText('Serviço indisponível')).toBeInTheDocument(),
    )
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'error' }))
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument()
  })

  it('shows a microphone-permission error when getUserMedia is denied', async () => {
    const permErr = Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
    mockGetUserMedia.mockRejectedValueOnce(permErr)
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))

    await waitFor(() =>
      expect(screen.getByText(/Permissão de microfone negada/i)).toBeInTheDocument(),
    )
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'error' }))
  })
})

// ── 9. Processing state ───────────────────────────────────────────────────────

describe('processing state', () => {
  it('shows a spinner and no action buttons while processing', async () => {
    mockDictateClinicalRecord.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(() =>
      expect(screen.getByText(/Transcrevendo e organizando/i)).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: /Aplicar/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Descartar/i })).not.toBeInTheDocument()
  })
})

// ── 10. Unmount / lifecycle safety ────────────────────────────────────────────

describe('unmount safety', () => {
  it('stops microphone tracks when the component unmounts during recording', async () => {
    const mockStop = vi.fn()
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: mockStop }],
    } as unknown as MediaStream)

    const user = userEvent.setup()
    const { unmount } = renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    unmount()

    expect(mockStop).toHaveBeenCalled()
  })

  it('does not fire the dictation API when the component unmounts during recording', async () => {
    const user = userEvent.setup()
    const { unmount } = renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    // Unmount while actively recording — this triggers the cleanup which calls
    // recorder.stop(). Without the isMountedRef guard, processAudio() would
    // continue and eventually fire dictateClinicalRecord().
    unmount()

    // Flush the microtask queue (FakeFileReader uses queueMicrotask internally)
    // and any settled promises before asserting.
    await new Promise<void>((resolve) => setTimeout(resolve, 0))

    expect(mockDictateClinicalRecord).not.toHaveBeenCalled()
  })
})

// ── 11. Field selection ───────────────────────────────────────────────────────

describe('field selection', () => {
  it('all suggested fields are checked by default after successful transcription', async () => {
    await reachSuccessState()
    const checkboxes = screen.getAllByRole('checkbox')
    // Mock returns chiefComplaint + clinicalEvolution — two checkboxes expected
    expect(checkboxes).toHaveLength(2)
    for (const cb of checkboxes) {
      expect(cb).toBeChecked()
    }
  })

  it('user can unselect a suggested field', async () => {
    await reachSuccessState()
    const user = userEvent.setup()

    const checkboxes = screen.getAllByRole('checkbox')
    // Uncheck the first field
    await user.click(checkboxes[0])

    expect(checkboxes[0]).not.toBeChecked()
    // The other field remains checked
    expect(checkboxes[1]).toBeChecked()
  })

  it('applying sends only the selected fields to onApplyFields', async () => {
    const onApplyFields = vi.fn()
    await reachSuccessState(onApplyFields)
    const user = userEvent.setup()

    // Uncheck the chiefComplaint checkbox (first in the list)
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    await user.click(screen.getByRole('button', { name: /Aplicar aos campos/i }))

    // Only the field whose checkbox remained checked should be passed
    const calledWith = onApplyFields.mock.calls[0][0] as Record<string, string>
    expect(Object.keys(calledWith)).toHaveLength(1)
    // The remaining field is whichever was not unchecked
    expect(Object.values(calledWith)[0]).toBeTruthy()
  })

  it('disables the apply button when all fields are unchecked', async () => {
    await reachSuccessState()
    const user = userEvent.setup()

    // Uncheck every checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    for (const cb of checkboxes) {
      await user.click(cb)
    }

    expect(screen.getByRole('button', { name: /Aplicar aos campos/i })).toBeDisabled()
  })
})
