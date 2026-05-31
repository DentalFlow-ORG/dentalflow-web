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

class FakeMediaRecorder {
  state: 'inactive' | 'recording' = 'inactive'
  ondataavailable: ((e: { data: Blob; size: number }) => void) | null = null
  onstop: (() => void) | null = null
  mimeType = 'audio/webm'

  static isTypeSupported = vi.fn(() => true)

  constructor() {
    latestRecorder = this
  }

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
      () => expect(screen.getByRole('button', { name: /Aplicar aos campos/i })).toBeInTheDocument(),
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
      () => expect(screen.getByRole('button', { name: /Aplicar aos campos/i })).toBeInTheDocument(),
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
      () => expect(screen.getByRole('button', { name: /Aplicar aos campos/i })).toBeInTheDocument(),
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
      expect(screen.getByText(/Processando ditado/i)).toBeInTheDocument()
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
      expect(screen.getByText(/Processando ditado/i)).toBeInTheDocument()
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
      expect(screen.getByText(/Processando ditado/i)).toBeInTheDocument()

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
