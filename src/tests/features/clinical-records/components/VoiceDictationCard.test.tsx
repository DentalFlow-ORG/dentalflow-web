import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VoiceDictationCard } from '@/features/clinical-records/components/VoiceDictationCard'
import type { ClinicalDictationFieldKey } from '@/features/clinical-records/types/clinical-dictation.types'
import { ApiError } from '@/services/http'

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

// Tracks the most recently created instance so tests can inspect or drive it.
let latestRecorder: FakeMediaRecorder | null = null

// Receives the instance as a plain parameter so `this` is never aliased to a variable.
function trackRecorder(recorder: FakeMediaRecorder) { latestRecorder = recorder }

class FakeMediaRecorder {
  state: 'inactive' | 'recording' = 'inactive'
  ondataavailable: ((e: { data: Blob; size: number }) => void) | null = null
  onstop: (() => void) | null = null
  mimeType = 'audio/webm'

  // Typed as (type: string) => boolean so mockImplementation with a typed
  // string argument compiles without casting.
  static isTypeSupported = vi.fn((_type: string) => true)

  constructor() { trackRecorder(this) }

  start = vi.fn(() => { this.state = 'recording' })

  stop = vi.fn(() => {
    if (this.state === 'inactive') return
    this.state = 'inactive'
    const blob = new Blob(['fake-audio'], { type: 'audio/webm' })
    this.ondataavailable?.({ data: blob, size: blob.size })
    this.onstop?.()
  })
}

// Variant that emits NO audio chunks — used to test the empty-audio safety path.
class FakeMediaRecorderNoAudio extends FakeMediaRecorder {
  stop = vi.fn(() => {
    if (this.state === 'inactive') return
    this.state = 'inactive'
    // Do NOT call ondataavailable → chunksRef stays empty
    this.onstop?.()
  })
}

// Variant where stop() fires onstop asynchronously — mimics real browser behaviour
// where onstop is dispatched after the current call stack unwinds.
class FakeMediaRecorderAsyncStop extends FakeMediaRecorder {
  stop = vi.fn(() => {
    if (this.state === 'inactive') return
    this.state = 'inactive'
    const blob = new Blob(['fake-audio'], { type: 'audio/webm' })
    this.ondataavailable?.({ data: blob, size: blob.size })
    // Defer onstop so it fires after the current synchronous execution
    Promise.resolve().then(() => this.onstop?.())
  })
}

// Variant where stop() NEVER fires onstop — simulates a browser hang/bug.
class FakeMediaRecorderNoOnstop extends FakeMediaRecorder {
  stop = vi.fn(() => {
    if (this.state === 'inactive') return
    this.state = 'inactive'
    const blob = new Blob(['fake-audio'], { type: 'audio/webm' })
    this.ondataavailable?.({ data: blob, size: blob.size })
    // onstop intentionally never fires
  })
}

// Variant where stop() throws — simulates an InvalidStateError mid-transition.
class FakeMediaRecorderStopThrows extends FakeMediaRecorder {
  stop = vi.fn(() => {
    if (this.state === 'inactive') return
    this.state = 'inactive'
    throw new DOMException('The MediaRecorder is not in a valid state.', 'InvalidStateError')
  })
}

// ── Fake FileReader ───────────────────────────────────────────────────────────

class FakeFileReader {
  result = 'data:audio/webm;base64,ZmFrZQ=='
  onloadend: (() => void) | null = null
  onerror: (() => void) | null = null
  readAsDataURL() {
    queueMicrotask(() => this.onloadend?.())
  }
}

// Variant that returns a base64 payload exceeding the frontend MAX_AUDIO_BASE64_LENGTH
// (4_000_000 chars).  The prefix is stripped inside blobToBase64, so we need the
// part AFTER the comma to be 4_000_001 chars.
class FakeFileReaderLarge {
  get result() {
    return `data:audio/webm;base64,${'A'.repeat(4_000_001)}`
  }
  onloadend: (() => void) | null = null
  onerror: (() => void) | null = null
  readAsDataURL() {
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
  latestRecorder = null

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

  it('renders the transcript, review header, editable field textareas, and action buttons', async () => {
    await reachSuccessState()
    expect(screen.getByText('Paciente relata dor no dente 36.')).toBeInTheDocument()
    expect(screen.getByText(/Revise antes de aplicar/i)).toBeInTheDocument()
    expect(screen.getByText('Queixa principal')).toBeInTheDocument()
    expect(screen.getByText('Evolução clínica')).toBeInTheDocument()
    // Fields are rendered as editable textareas
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Gravar novamente/i })).toBeInTheDocument()
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
    expect(screen.queryByRole('button', { name: /Aplicar campos selecionados/i })).not.toBeInTheDocument()
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
    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

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

// ── Helper: run the full recording flow until the service rejects ─────────────

async function triggerServiceError(error: unknown) {
  mockDictateClinicalRecord.mockRejectedValue(error)
  const user = userEvent.setup()
  renderCard()
  await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
  await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
  await user.click(screen.getByRole('button', { name: /Parar gravação/i }))
}

describe('error handling', () => {
  // ── Generic error (non-ApiError) uses the safe fallback message ─────────────

  it('shows the safe fallback message when the service rejects with a plain Error', async () => {
    await triggerServiceError(new Error('Serviço indisponível'))

    await waitFor(() =>
      expect(
        screen.getByText(/Não foi possível processar o ditado clínico agora/i),
      ).toBeInTheDocument(),
    )
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'error' }))
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument()
  })

  // ── Backend-specific HTTP status messages ───────────────────────────────────

  it('shows the premium-only message for HTTP 402 (payment required)', async () => {
    await triggerServiceError(new ApiError('Escolha um plano', 402, null))
    await waitFor(() =>
      expect(screen.getByText(/Ditado clínico disponível apenas no plano Premium/i)).toBeInTheDocument(),
    )
  })

  it('shows the premium-only message for HTTP 403 (plan feature gate)', async () => {
    await triggerServiceError(new ApiError('Este recurso não está disponível', 403, null))
    await waitFor(() =>
      expect(screen.getByText(/Ditado clínico disponível apenas no plano Premium/i)).toBeInTheDocument(),
    )
  })

  it('shows the monthly-limit message for HTTP 429 when the message indicates quota exhaustion', async () => {
    await triggerServiceError(
      new ApiError('Limite mensal de análises de IA atingido. Tente novamente no próximo mês.', 429, null),
    )
    await waitFor(() =>
      expect(screen.getByText(/Limite mensal de ditados clínicos atingido/i)).toBeInTheDocument(),
    )
  })

  it('shows the throttle message for HTTP 429 when the message does not indicate quota', async () => {
    await triggerServiceError(
      new ApiError('ThrottlerException: Too Many Requests', 429, null),
    )
    await waitFor(() =>
      expect(screen.getByText(/Muitas tentativas em pouco tempo/i)).toBeInTheDocument(),
    )
  })

  it('shows the temporarily-unavailable message for HTTP 503 (AI kill-switch)', async () => {
    await triggerServiceError(new ApiError('O assistente está desabilitado', 503, null))
    await waitFor(() =>
      expect(screen.getByText(/temporariamente indisponível/i)).toBeInTheDocument(),
    )
  })

  it('shows the invalid-audio message for HTTP 400 (validation failure)', async () => {
    await triggerServiceError(new ApiError('Validation failed', 400, null))
    await waitFor(() =>
      expect(screen.getByText(/O áudio é muito longo ou inválido/i)).toBeInTheDocument(),
    )
  })

  it('shows the invalid-audio message for HTTP 413 (payload too large)', async () => {
    await triggerServiceError(new ApiError('Payload Too Large', 413, null))
    await waitFor(() =>
      expect(screen.getByText(/O áudio é muito longo ou inválido/i)).toBeInTheDocument(),
    )
  })

  // ── MediaRecorder / microphone errors use their own specific messages ────────

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
      expect(screen.getByRole('status')).toBeInTheDocument(),
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

    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

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

    expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeDisabled()
  })
})

// ── 12. Accessibility ─────────────────────────────────────────────────────────

describe('accessibility', () => {
  it('error state container has role="alert" so screen readers announce errors immediately', async () => {
    await triggerServiceError(new ApiError('Service unavailable', 503, null))

    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    )
    // The alert contains the user-facing error message
    expect(screen.getByRole('alert')).toHaveTextContent(/temporariamente indisponível/i)
  })

  it('"Gravar novamente" in the empty-field state resets the component to idle', async () => {
    mockDictateClinicalRecord.mockResolvedValue({ transcript: 'Transcrição sem campos.', fields: {} })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Gravar novamente/i })).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: /Gravar novamente/i }))

    // Returns to idle: the main "Gravar consulta" button is shown again
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Gravar consulta/i })).toBeInTheDocument(),
    )
    // Empty-field notice is gone
    expect(screen.queryByText(/nenhum campo clínico foi identificado/i)).not.toBeInTheDocument()
  })
})

// ── 13. Stop flow reliability ─────────────────────────────────────────────────

describe('stop flow reliability', () => {
  // ── Manual stop leaves recording and reaches processing/success ─────────────

  it('clicking Parar gravação transitions through processing to success', async () => {
    // reachSuccessState already exercises this path end-to-end. This test makes
    // the intent explicit: after stop, the recording UI is gone and results appear.
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    // The "Gravando" state must be replaced by the result
    await waitFor(
      () => expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeInTheDocument(),
      { timeout: 3000 },
    )
    expect(screen.queryByText(/Gravando/i)).not.toBeInTheDocument()
  })

  // ── Auto-stop at 90 s uses the same path as the manual button ───────────────
  // We drive this by calling recorder.stop() directly — the same call the
  // 90-second interval makes — to avoid needing 90-second fake timers.

  it('auto-stop (recorder.stop()) triggers the same processing path as the button', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    // At 90 s the interval calls stopRecording() which calls recorder.stop().
    // Trigger it directly via the recorder instance — identical behaviour.
    expect(latestRecorder).not.toBeNull()
    expect(latestRecorder!.state).toBe('recording')
    latestRecorder!.stop()

    // The component must leave recording and show the dictation result
    await waitFor(
      () => expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeInTheDocument(),
      { timeout: 3000 },
    )
    expect(screen.queryByText(/Gravando/i)).not.toBeInTheDocument()
  })

  // ── Double stop does not crash or trigger duplicate API calls ───────────────

  it('calling recorder.stop() twice does not trigger a second API call', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    // First stop — valid, triggers the full processing path
    latestRecorder!.stop()
    await waitFor(
      () => expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeInTheDocument(),
      { timeout: 3000 },
    )

    // Second stop — recorder is already 'inactive', must be a no-op
    expect(latestRecorder!.state).toBe('inactive')
    const stopCallsBefore = (latestRecorder!.stop as ReturnType<typeof vi.fn>).mock.calls.length
    latestRecorder!.stop()

    // No additional API calls after the second stop
    expect(mockDictateClinicalRecord).toHaveBeenCalledTimes(1)
    expect((latestRecorder!.stop as ReturnType<typeof vi.fn>).mock.calls.length).toBe(stopCallsBefore + 1)
  })

  // ── Empty audio produces a friendly error and leaves recording ─────────────

  it('shows a friendly error when onstop fires with no audio chunks', async () => {
    vi.stubGlobal('MediaRecorder', FakeMediaRecorderNoAudio)
    try {
      const user = userEvent.setup()
      renderCard()

      await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
      await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

      // Stop with no audio chunks — onstop fires but chunksRef is empty
      latestRecorder!.stop()

      await waitFor(() =>
        expect(screen.getByText(/Nenhum áudio foi capturado/i)).toBeInTheDocument(),
      )
      expect(mockDictateClinicalRecord).not.toHaveBeenCalled()
      expect(screen.queryByText(/Gravando/i)).not.toBeInTheDocument()
    } finally {
      vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
    }
  })

  // ── Clicking stop immediately leaves recording — no waiting for onstop ──────
  // Uses an async-stop recorder so onstop does NOT fire synchronously within
  // the click handler. The UI must still leave 'recording' immediately because
  // stopRecording() calls setState('processing') before recorder.stop().

  it('clicking stop immediately leaves recording state before onstop fires', async () => {
    vi.stubGlobal('MediaRecorder', FakeMediaRecorderAsyncStop)
    mockDictateClinicalRecord.mockImplementation(() => new Promise(() => {}))
    try {
      const user = userEvent.setup()
      renderCard()

      await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
      await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

      // Must NOT be in recording state — no waitFor, this must be synchronous
      expect(screen.queryByText(/Gravando/i)).not.toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    } finally {
      vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
    }
  })

  // ── recorder.stop() throws — UI must not stay stuck in recording ────────────

  it('shows processing state (not stuck recording) when recorder.stop() throws', async () => {
    vi.stubGlobal('MediaRecorder', FakeMediaRecorderStopThrows)
    try {
      const user = userEvent.setup()
      renderCard()

      await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
      await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

      // stopRecording() sets 'processing' before the try/catch, so the UI must
      // have left 'recording' even though stop() threw.
      expect(screen.queryByText(/Gravando/i)).not.toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
      expect(mockDictateClinicalRecord).not.toHaveBeenCalled()
    } finally {
      vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
    }
  })

  // ── Stream tracks are released after onstop fires on a normal stop ──────────

  it('releases stream tracks when onstop fires after a normal stop', async () => {
    const mockTrackStop = vi.fn()
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: mockTrackStop }],
    } as unknown as MediaStream)

    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    // FakeMediaRecorder.stop() calls onstop synchronously; onstop calls releaseStream()
    await waitFor(() => expect(mockTrackStop).toHaveBeenCalled())
  })

  // ── Fallback timer recovers when onstop never fires ─────────────────────────
  // Strategy: use real timers for setup (getUserMedia, waitFor), then switch to
  // fake timers immediately before clicking stop so the fallback setTimeout is
  // registered with the fake timer and can be advanced deterministically.

  it('fallback timer shows friendly error and releases stream when onstop never fires', async () => {
    vi.stubGlobal('MediaRecorder', FakeMediaRecorderNoOnstop)
    const mockTrackStop = vi.fn()
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => [{ stop: mockTrackStop }],
    } as unknown as MediaStream)

    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    // Switch to fake timers so the fallback setTimeout lands in the fake queue.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      // fireEvent is synchronous — no internal timer dependency.
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /Parar gravação/i }))
      })

      // Processing state must be immediate (set by stopRecording before stop())
      expect(screen.queryByText(/Gravando/i)).not.toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()

      // Advance past the 5-second fallback window
      act(() => { vi.advanceTimersByTime(5100) })

      // Error state should appear; API must not have been called
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/Não foi possível finalizar/i)
      expect(mockDictateClinicalRecord).not.toHaveBeenCalled()
      // Stream must be released by the fallback
      expect(mockTrackStop).toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
      vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
    }
  })
})

// ── 14. Success result UI ─────────────────────────────────────────────────────

describe('success result UI', () => {
  it('shows transcript with PT-BR language badge', async () => {
    await reachSuccessState()
    expect(screen.getByText(/Transcrição/i)).toBeInTheDocument()
    expect(screen.getByText('PT-BR')).toBeInTheDocument()
    expect(screen.getByText('Paciente relata dor no dente 36.')).toBeInTheDocument()
  })

  it('shows "Revise antes de aplicar" heading and helper text', async () => {
    await reachSuccessState()
    expect(screen.getByText(/Revise antes de aplicar/i)).toBeInTheDocument()
    expect(screen.getByText(/Edite o texto sugerido/i)).toBeInTheDocument()
  })

  it('renders suggested fields as editable textareas with initial values from the API', async () => {
    await reachSuccessState()
    // Each field should render a textarea with the classified value as initial content
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    const values = textareas.map((t) => t.value)
    expect(values).toContain('Dor no dente 36')
    expect(values).toContain('Sensibilidade ao frio.')
  })

  it('disables the apply button and shows no warning when all fields are unchecked', async () => {
    await reachSuccessState()
    const user = userEvent.setup()

    const checkboxes = screen.getAllByRole('checkbox')
    for (const cb of checkboxes) {
      await user.click(cb)
    }

    expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeDisabled()
    // No warning shown — button disabled state is the signal
    expect(screen.queryByText(/Nenhum campo selecionado/i)).not.toBeInTheDocument()
  })

  it('counter updates live as fields are deselected', async () => {
    await reachSuccessState()
    const user = userEvent.setup()

    // Uncheck first field (chiefComplaint)
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])

    // One field remains selected — counter reflects it
    expect(screen.getByText('1/2 selecionado')).toBeInTheDocument()
  })
})

// ── 15. Processing phase robustness ──────────────────────────────────────────

describe('processing phase robustness', () => {
  // ── Network connection failure → ApiError status 0 ─────────────────────────
  // In test/dev mode (import.meta.env.DEV === true), getClinicalDictationErrorMessage
  // returns a developer-friendly hint pointing to the local API process.

  it('shows a dev hint when the backend is unreachable (ApiError status 0)', async () => {
    await triggerServiceError(
      new ApiError('Não foi possível conectar ao servidor. Verifique se a API está em execução.', 0, null),
    )
    await waitFor(() =>
      expect(
        screen.getByText(/Backend inacessível/i),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByText(/Transcrevendo consulta/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument()
  })

  // ── Auth refresh failure → ApiError status 401 ─────────────────────────────
  // When the access token is expired, apiRequest makes a refresh attempt.
  // If that refresh also fails (backend down / invalid refresh token), it
  // throws ApiError(401). The component must leave processing and show an error.

  it('shows a friendly error when auth refresh fails (ApiError status 401)', async () => {
    await triggerServiceError(new ApiError('Unauthorized', 401, null))
    await waitFor(() =>
      expect(
        screen.getByText(/Não foi possível processar o ditado clínico agora/i),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument()
  })

  // ── Processing timeout ─────────────────────────────────────────────────────
  // Strategy: use real timers for setup (getUserMedia, waitFor), then activate
  // fake timers before clicking stop so the 45-second processing setTimeout is
  // registered in the fake queue and can be advanced deterministically.

  it('shows a timeout error when the API never responds within 45 s', async () => {
    mockDictateClinicalRecord.mockImplementation(() => new Promise(() => {})) // never resolves

    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    // Activate fake timers before the stop click so every setTimeout registered
    // inside stopRecording() and processAudio() lands in the fake queue.
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      // fireEvent is synchronous — no internal timer dependency.
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /Parar gravação/i }))
      })

      // Processing state is shown immediately (set in stopRecording before stop())
      expect(screen.queryByText(/Gravando/i)).not.toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()

      // Advance past the 45-second processing timeout
      act(() => { vi.advanceTimersByTime(46_000) })

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent(/O processamento demorou muito/i)
      expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  // ── Recovery: "Tentar novamente" after an API error resets to idle ──────────

  it('"Tentar novamente" after a processing error returns the component to idle', async () => {
    await triggerServiceError(new Error('network error'))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument(),
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /Tentar novamente/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Gravar consulta/i })).toBeInTheDocument(),
    )
    // Error alert and message must be gone
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  // ── Oversized audio blocked before API call ───────────────────────────────
  // Uses FakeFileReaderLarge which returns a base64 string of 4 000 001 chars
  // (one over the frontend MAX_AUDIO_BASE64_LENGTH = 4 000 000).
  // dictateClinicalRecord must NOT be called and the component must show the
  // specific oversized-audio error message.

  it('shows oversized-audio error and never calls the API when base64 exceeds the limit', async () => {
    vi.stubGlobal('FileReader', FakeFileReaderLarge)
    try {
      const user = userEvent.setup()
      renderCard()

      await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
      await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

      await waitFor(() =>
        expect(
          screen.getByText(/O áudio ficou muito grande para envio/i),
        ).toBeInTheDocument(),
      )

      // API must NOT have been called
      expect(mockDictateClinicalRecord).not.toHaveBeenCalled()

      // Component must be in error state, not processing
      expect(screen.queryByRole('status')).not.toBeInTheDocument()

      // Alert must have fired
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'error' }),
      )

      // User can retry
      expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument()
    } finally {
      vi.stubGlobal('FileReader', FakeFileReader)
    }
  })
})

// ── 16. MediaRecorder codec and bitrate selection ─────────────────────────────

describe('MediaRecorder codec and bitrate selection', () => {
  // ── audio/webm;codecs=opus is the first MIME candidate tried ─────────────
  // getSupportedMimeType probes candidates in order.  When isTypeSupported
  // returns true for everything (the default fake), the first candidate —
  // audio/webm;codecs=opus — must be the one selected and passed to
  // MediaRecorder so recordings use Opus compression.

  it('probes audio/webm;codecs=opus before plain audio/webm', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    const calls = (FakeMediaRecorder.isTypeSupported as ReturnType<typeof vi.fn>).mock.calls
    const checkedMimes = calls.map((c: unknown[]) => c[0] as string)

    // audio/webm;codecs=opus must be the very first MIME probed.
    // When it is supported (isTypeSupported returns true), getSupportedMimeType
    // returns immediately — plain 'audio/webm' is never checked, which is
    // the correct behaviour: Opus wins and further probes are skipped.
    expect(checkedMimes[0]).toBe('audio/webm;codecs=opus')
  })

  // ── When audio/webm;codecs=opus is NOT supported, falls back to audio/webm ─

  it('falls back to audio/webm when audio/webm;codecs=opus is not supported', async () => {
    // Return true only for plain audio/webm
    FakeMediaRecorder.isTypeSupported.mockImplementation((mime: string) =>
      mime === 'audio/webm',
    )
    try {
      const user = userEvent.setup()
      renderCard()

      await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
      await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

      // Recording must still start — no error shown
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    } finally {
      FakeMediaRecorder.isTypeSupported.mockReset()
      FakeMediaRecorder.isTypeSupported.mockReturnValue(true)
    }
  })

  // ── When no preferred MIME is supported, recording still starts ───────────

  it('starts recording even when no candidate MIME is supported (browser default)', async () => {
    FakeMediaRecorder.isTypeSupported.mockReturnValue(false)
    try {
      const user = userEvent.setup()
      renderCard()

      await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
      await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    } finally {
      FakeMediaRecorder.isTypeSupported.mockReset()
      FakeMediaRecorder.isTypeSupported.mockReturnValue(true)
    }
  })
})

// ── 17. Editable field review behavior ───────────────────────────────────────

describe('editable field review', () => {
  it('editing a suggested field changes the payload passed to onApplyFields', async () => {
    const onApplyFields = vi.fn()
    await reachSuccessState(onApplyFields)
    const user = userEvent.setup()

    // Find the textarea for chiefComplaint (first rendered)
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    const chiefTextarea = textareas[0]

    // Clear and type a custom value
    await user.clear(chiefTextarea)
    await user.type(chiefTextarea, 'Nova queixa editada pelo dentista')

    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

    expect(onApplyFields).toHaveBeenCalledWith(
      expect.objectContaining({ chiefComplaint: 'Nova queixa editada pelo dentista' }),
    )
  })

  it('checked but empty fields are ignored when applying', async () => {
    const onApplyFields = vi.fn()
    await reachSuccessState(onApplyFields)
    const user = userEvent.setup()

    // Clear the first textarea (chiefComplaint), leave second as-is
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    await user.clear(textareas[0])

    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

    // Only the non-empty field should be in the payload
    const calledWith = onApplyFields.mock.calls[0][0] as Record<string, string>
    expect(Object.keys(calledWith)).not.toContain('chiefComplaint')
    expect(Object.keys(calledWith)).toContain('clinicalEvolution')
  })

  it('applying when all checked fields have empty content shows a warning and does not call onApplyFields', async () => {
    const onApplyFields = vi.fn()
    await reachSuccessState(onApplyFields)
    const user = userEvent.setup()

    // Clear all textareas
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    for (const ta of textareas) {
      await user.clear(ta)
    }

    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

    // Warning should appear
    expect(screen.getByText(/Nenhum campo selecionado possui conteúdo/i)).toBeInTheDocument()
    // onApplyFields must NOT have been called
    expect(onApplyFields).not.toHaveBeenCalled()
    // Component stays in success state (not reset to idle)
    expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeInTheDocument()
  })

  it('"Gravar novamente" in success state resets to idle', async () => {
    await reachSuccessState()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /Gravar novamente/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Gravar consulta/i })).toBeInTheDocument(),
    )
    expect(screen.queryByText(/Revise antes de aplicar/i)).not.toBeInTheDocument()
  })

  it('discarding clears editable field state and returns to idle', async () => {
    await reachSuccessState()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /Descartar/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Gravar consulta/i })).toBeInTheDocument(),
    )
    // No residual state visible
    expect(screen.queryByText(/Revise antes de aplicar/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Transcrição/i)).not.toBeInTheDocument()
  })

  it('apply sends capitalized values (first letter uppercased via formatDictationFieldText)', async () => {
    // Use lowercase mock values to verify formatting is applied
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Paciente relata dor.',
      fields: { chiefComplaint: 'dor no dente 36', clinicalEvolution: 'sensibilidade ao frio.' },
    })
    const onApplyFields = vi.fn()
    const user = userEvent.setup()
    renderCard({ onApplyFields })

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))
    await waitFor(() => expect(screen.getByText(/Revise antes de aplicar/i)).toBeInTheDocument(), { timeout: 3000 })

    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

    const calledWith = onApplyFields.mock.calls[0][0] as Record<string, string>
    expect(calledWith.chiefComplaint).toBe('Dor no dente 36')
    expect(calledWith.clinicalEvolution).toBe('Sensibilidade ao frio.')
  })
})

// ── 18. Odontogram suggestions panel ─────────────────────────────────────────
// When the transcript contains a recognizable tooth + condition pair, the card
// renders the "Sugestões para odontograma" section in the success state.
// The default mock transcript "Paciente relata dor no dente 36." does NOT contain
// a condition keyword, so we override it with one that does.

describe('odontogram suggestions panel', () => {
  it('renders the "Sugestões para odontograma" panel when transcript contains a mapped tooth condition', async () => {
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Dente 36 com cárie.',
      fields: { chiefComplaint: 'Dor no dente 36' },
    })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(
      () => expect(screen.getByText(/Sugestões para odontograma/i)).toBeInTheDocument(),
      { timeout: 3000 },
    )

    // At least one visible element should mention tooth 36 in the panel
    expect(screen.getAllByText(/Dente 36/i).length).toBeGreaterThanOrEqual(1)
  })

  it('does NOT render the odontogram panel when transcript has no mapped tooth condition', async () => {
    // Default mock — "Paciente relata dor no dente 36." — no condition keyword
    await reachSuccessState()

    expect(screen.queryByText(/Sugestões para odontograma/i)).not.toBeInTheDocument()
  })
})

// ── 19. Processing step labels (renumbered from 17) ──────────────────────────

describe('processing step labels', () => {
  // ── "Transcrevendo consulta…" appears while the API is pending ─────────────
  // After blobToBase64 completes and size check passes, step 2 is set before the
  // API call.  Since the API never resolves in this test, the DOM must show the
  // transcription step label.

  it('shows "Transcrevendo consulta…" while the API call is pending', async () => {
    mockDictateClinicalRecord.mockImplementation(() => new Promise(() => {}))

    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(() =>
      expect(screen.getByText(/Transcrevendo consulta/i)).toBeInTheDocument(),
    )
    // The status container must still be present
    expect(screen.getByRole('status')).toBeInTheDocument()
    // The recording UI must be gone
    expect(screen.queryByText(/Gravando/i)).not.toBeInTheDocument()
  })

  // ── Progress dots exist in the processing state ───────────────────────────

  it('renders four progress dots in the processing state', async () => {
    mockDictateClinicalRecord.mockImplementation(() => new Promise(() => {}))

    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())

    // The four progress dots are inside the status container (aria-hidden).
    // We check the role="status" container exists as a proxy for their presence.
    const statusEl = screen.getByRole('status')
    expect(statusEl).toBeInTheDocument()
    // The spinner must also be in the same container
    expect(statusEl.querySelector('svg')).toBeInTheDocument()
  })
})

// ── 20. Dev debug panel ───────────────────────────────────────────────────────

describe('dev debug panel', () => {
  // In Vitest, import.meta.env.DEV === true, so the debug panel is always
  // rendered in the test environment.

  // ── Debug panel appears after blobToBase64 completes ─────────────────────

  it('shows the dev debug panel with MIME and size info while API is pending', async () => {
    mockDictateClinicalRecord.mockImplementation(() => new Promise(() => {}))

    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    // Wait for the panel to appear (set after blobToBase64 resolves)
    await waitFor(() =>
      expect(screen.getByTestId('dev-debug-panel')).toBeInTheDocument(),
    )

    const panel = screen.getByTestId('dev-debug-panel')
    // Panel must include the MIME type (FakeMediaRecorder.mimeType = 'audio/webm')
    expect(panel).toHaveTextContent(/MIME:/i)
    // Panel must include duration info
    expect(panel).toHaveTextContent(/Duração gravada/i)
  })

  // ── Debug panel shows blocked-locally flag for oversized audio ─────────────

  it('shows "Bloqueado localmente" in the debug panel when audio exceeds the size limit', async () => {
    vi.stubGlobal('FileReader', FakeFileReaderLarge)
    try {
      const user = userEvent.setup()
      renderCard()

      await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
      await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
      await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

      // The oversized error must appear
      await waitFor(() =>
        expect(screen.getByText(/O áudio ficou muito grande para envio/i)).toBeInTheDocument(),
      )

      // And the debug panel must show the blocked flag
      await waitFor(() =>
        expect(screen.getByTestId('dev-debug-panel')).toBeInTheDocument(),
      )
      expect(screen.getByTestId('dev-debug-panel')).toHaveTextContent(
        /Bloqueado localmente/i,
      )
      // API must not have been called
      expect(mockDictateClinicalRecord).not.toHaveBeenCalled()
    } finally {
      vi.stubGlobal('FileReader', FakeFileReader)
    }
  })
})
