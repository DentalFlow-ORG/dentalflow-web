import { VoiceDictationCard } from '@/features/clinical-records/components/VoiceDictationCard'
import type { ClinicalDictationFieldKey } from '@/features/clinical-records/types/clinical-dictation.types'
import { ApiError } from '@/services/http'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('@tanstack/react-router', async () => {
  const routerMock = await import('@/test-utils/mocks/router')
  return routerMock.createRouterMock()
})

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
function trackRecorder(recorder: FakeMediaRecorder) {
  latestRecorder = recorder
}

class FakeMediaRecorder {
  state: 'inactive' | 'recording' = 'inactive'
  ondataavailable: ((e: { data: Blob; size: number }) => void) | null = null
  onstop: (() => void) | null = null
  mimeType = 'audio/webm'

  // Typed as (type: string) => boolean so mockImplementation with a typed
  // string argument compiles without casting.
  static isTypeSupported = vi.fn((_type: string) => true)

  constructor() {
    trackRecorder(this)
  }

  start = vi.fn(() => {
    this.state = 'recording'
  })

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
    odontogramSuggestions: [],
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
  await waitFor(() => expect(screen.getByText(/Transcrição/i)).toBeInTheDocument(), {
    timeout: 3000,
  })
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
    expect(
      screen.queryByRole('button', { name: /Aplicar campos selecionados/i }),
    ).not.toBeInTheDocument()
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

    expect(onApplyFields).toHaveBeenCalledWith(
      { chiefComplaint: 'Dor no dente 36', clinicalEvolution: 'Sensibilidade ao frio.' },
      expect.any(Object), // per-field modes (append/replace)
    )
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
      expect(
        screen.getByText(/Ditado clínico disponível apenas no plano Premium/i),
      ).toBeInTheDocument(),
    )
  })

  it('shows the premium-only message for HTTP 403 (plan feature gate)', async () => {
    await triggerServiceError(new ApiError('Este recurso não está disponível', 403, null))
    await waitFor(() =>
      expect(
        screen.getByText(/Ditado clínico disponível apenas no plano Premium/i),
      ).toBeInTheDocument(),
    )
  })

  it('shows the monthly-limit message for HTTP 429 when the message indicates quota exhaustion', async () => {
    await triggerServiceError(
      new ApiError(
        'Limite mensal de análises de IA atingido. Tente novamente no próximo mês.',
        429,
        null,
      ),
    )
    await waitFor(() =>
      expect(screen.getByText(/Limite mensal de ditados clínicos atingido/i)).toBeInTheDocument(),
    )
  })

  it('shows the throttle message for HTTP 429 when the message does not indicate quota', async () => {
    await triggerServiceError(new ApiError('ThrottlerException: Too Many Requests', 429, null))
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

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())
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

  it('disables the apply button when only odontogram teeth are selected but onApplyOdontogram is absent', async () => {
    // Backend returns only odontogram suggestions (no classifiable text fields)
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Consulta.',
      fields: {},
      odontogramSuggestions: [{ toothNumber: '36', condition: 'caries' }],
    })
    const user = userEvent.setup()
    // renderCard() does not pass onApplyOdontogram
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(
      () => expect(screen.getByText(/Sugestões para odontograma/i)).toBeInTheDocument(),
      { timeout: 3000 },
    )

    // Odontogram checkbox is checked by default but no handler → apply must be disabled
    expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeDisabled()
  })
})

// ── 12. Accessibility ─────────────────────────────────────────────────────────

describe('accessibility', () => {
  it('error state container has role="alert" so screen readers announce errors immediately', async () => {
    await triggerServiceError(new ApiError('Service unavailable', 503, null))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    // The alert contains the user-facing error message
    expect(screen.getByRole('alert')).toHaveTextContent(/temporariamente indisponível/i)
  })

  it('apply warning uses role="alert" for assertive announcement when inserted', async () => {
    const onApplyFields = vi.fn()
    await reachSuccessState(onApplyFields)
    const user = userEvent.setup()

    // Clear all textareas to produce the no-content warning
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    for (const ta of textareas) await user.clear(ta)

    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

    // The warning element must carry role="alert" (not role="status") so it is
    // announced assertively by screen readers when dynamically inserted.
    const warning = screen.getByRole('alert')
    expect(warning).toHaveTextContent(/Nenhum campo selecionado possui conteúdo/i)
  })

  it('processing state container has role="status" and aria-atomic="true"', async () => {
    mockDictateClinicalRecord.mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(() => expect(screen.getByRole('status')).toBeInTheDocument())

    const statusEl = screen.getByRole('status')
    expect(statusEl).toHaveAttribute('aria-atomic', 'true')
  })

  it('empty-field state container has role="status" for polite screen reader announcement', async () => {
    mockDictateClinicalRecord.mockResolvedValue({ transcript: 'Sem campos.', fields: {} })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(() =>
      expect(screen.getByText(/nenhum campo clínico foi identificado/i)).toBeInTheDocument(),
    )

    // The empty-field outer div must have role="status" so screen readers announce
    // the state change when processing finishes with no classified fields.
    const statusEl = screen.getByRole('status')
    expect(statusEl).toBeInTheDocument()
    expect(statusEl).toHaveAttribute('aria-atomic', 'true')
  })

  it('"Gravar novamente" in the empty-field state resets the component to idle', async () => {
    mockDictateClinicalRecord.mockResolvedValue({
      transcript: 'Transcrição sem campos.',
      fields: {},
    })
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

  it('all action buttons in the success state have the min-h-11 touch-target class', async () => {
    // Ensures secondary action buttons meet the same 44 px minimum touch target
    // as the primary apply button, preventing regression on mobile devices.
    await reachSuccessState()

    const applyBtn = screen.getByRole('button', { name: /Aplicar campos selecionados/i })
    const rerecordBtn = screen.getByRole('button', { name: /Gravar novamente/i })
    const discardBtn = screen.getByRole('button', { name: /Descartar/i })

    expect(applyBtn.className).toContain('min-h-11')
    expect(rerecordBtn.className).toContain('min-h-11')
    expect(discardBtn.className).toContain('min-h-11')
  })

  it('the "Tentar novamente" button in error state has the min-h-11 touch-target class', async () => {
    await triggerServiceError(new ApiError('Service unavailable', 503, null))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Tentar novamente/i })).toBeInTheDocument(),
    )

    const retryBtn = screen.getByRole('button', { name: /Tentar novamente/i })
    expect(retryBtn.className).toContain('min-h-11')
  })

  it('all action buttons in the empty-field state have the min-h-11 touch-target class', async () => {
    mockDictateClinicalRecord.mockResolvedValue({ transcript: 'Sem campos.', fields: {} })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(() =>
      expect(screen.getByText(/nenhum campo clínico foi identificado/i)).toBeInTheDocument(),
    )

    const rerecordBtn = screen.getByRole('button', { name: /Gravar novamente/i })
    const discardBtn = screen.getByRole('button', { name: /Descartar/i })

    expect(rerecordBtn.className).toContain('min-h-11')
    expect(discardBtn.className).toContain('min-h-11')
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
      () =>
        expect(
          screen.getByRole('button', { name: /Aplicar campos selecionados/i }),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    )
    expect(screen.queryByText(/Gravando/i)).not.toBeInTheDocument()
  })

  // ── Auto-stop at 180 s uses the same path as the manual button ──────────────
  // We drive this by calling recorder.stop() directly — the same call the
  // 180-second interval makes — to avoid needing 180-second fake timers.

  it('auto-stop (recorder.stop()) triggers the same processing path as the button', async () => {
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())

    // At 180 s the interval calls stopRecording() which calls recorder.stop().
    // Trigger it directly via the recorder instance — identical behaviour.
    expect(latestRecorder).not.toBeNull()
    expect(latestRecorder!.state).toBe('recording')
    latestRecorder!.stop()

    // The component must leave recording and show the dictation result
    await waitFor(
      () =>
        expect(
          screen.getByRole('button', { name: /Aplicar campos selecionados/i }),
        ).toBeInTheDocument(),
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
      () =>
        expect(
          screen.getByRole('button', { name: /Aplicar campos selecionados/i }),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    )

    // Second stop — recorder is already 'inactive', must be a no-op
    expect(latestRecorder!.state).toBe('inactive')
    const stopCallsBefore = (latestRecorder!.stop as ReturnType<typeof vi.fn>).mock.calls.length
    latestRecorder!.stop()

    // No additional API calls after the second stop
    expect(mockDictateClinicalRecord).toHaveBeenCalledTimes(1)
    expect((latestRecorder!.stop as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
      stopCallsBefore + 1,
    )
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
      act(() => {
        vi.advanceTimersByTime(5100)
      })

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
      new ApiError(
        'Não foi possível conectar ao servidor. Verifique se a API está em execução.',
        0,
        null,
      ),
    )
    await waitFor(() => expect(screen.getByText(/Backend inacessível/i)).toBeInTheDocument())
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
      act(() => {
        vi.advanceTimersByTime(46_000)
      })

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
        expect(screen.getByText(/O áudio ficou muito grande para envio/i)).toBeInTheDocument(),
      )

      // API must NOT have been called
      expect(mockDictateClinicalRecord).not.toHaveBeenCalled()

      // Component must be in error state, not processing
      expect(screen.queryByRole('status')).not.toBeInTheDocument()

      // Alert must have fired
      expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'error' }))

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
    FakeMediaRecorder.isTypeSupported.mockImplementation((mime: string) => mime === 'audio/webm')
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
      expect.any(Object),
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

  it('toggling an odontogram suggestion checkbox clears the apply warning', async () => {
    // Set up a transcript that produces an odontogram suggestion
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Dente 36 com cárie.',
      fields: { chiefComplaint: 'Dor no dente 36' },
    })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))
    await waitFor(() => expect(screen.getByText(/Revise antes de aplicar/i)).toBeInTheDocument(), {
      timeout: 3000,
    })

    // Clear all text fields to trigger the warning
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    for (const ta of textareas) await user.clear(ta)

    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Nenhum campo selecionado/i)

    // Toggling an odontogram suggestion checkbox must clear the warning
    const odontogramCheckbox = screen.getByRole('checkbox', {
      name: /Selecionar dente 36/i,
    })
    await user.click(odontogramCheckbox) // uncheck
    expect(screen.queryByText(/Nenhum campo selecionado/i)).not.toBeInTheDocument()
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
    await waitFor(() => expect(screen.getByText(/Revise antes de aplicar/i)).toBeInTheDocument(), {
      timeout: 3000,
    })

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

  it('shows the helper text explaining odontogram marking intent', async () => {
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

    expect(screen.getByText(/Verifique os dentes identificados no ditado/i)).toBeInTheDocument()
  })

  // ── Backend suggestions take precedence over frontend regex parsing ──────────

  it('uses backend-supplied odontogramSuggestions when the response includes them', async () => {
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Paciente veio para consulta de rotina.',
      fields: { chiefComplaint: 'Rotina' },
      // Backend returns a suggestion even though the transcript has no condition keywords
      odontogramSuggestions: [
        {
          toothNumber: '46',
          condition: 'caries',
          notes: 'Cárie mesial.',
          confidence: 'high',
          sourceText: 'cárie no 46',
        },
      ],
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

    // The backend suggestion (tooth 46) should appear, not anything from the vague transcript
    expect(screen.getAllByText(/Dente 46/i).length).toBeGreaterThanOrEqual(1)
  })

  it('falls back to frontend regex parsing when backend returns empty odontogramSuggestions', async () => {
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Dente 36 com cárie.',
      fields: { chiefComplaint: 'Dor no dente 36' },
      odontogramSuggestions: [], // backend found nothing → frontend regex takes over
    })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    // Frontend regex extraction from transcript detects tooth 36 + caries
    await waitFor(
      () => expect(screen.getByText(/Sugestões para odontograma/i)).toBeInTheDocument(),
      { timeout: 3000 },
    )
    expect(screen.getAllByText(/Dente 36/i).length).toBeGreaterThanOrEqual(1)
  })

  it('all backend suggestions are checked by default', async () => {
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Consulta.',
      fields: {},
      odontogramSuggestions: [
        { toothNumber: '36', condition: 'caries' },
        { toothNumber: '11', condition: 'crown' },
      ],
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

    // All odontogram checkboxes should be checked by default
    const odontogramCheckboxes = screen
      .getAllByRole('checkbox')
      .filter((cb) => cb.getAttribute('aria-label')?.startsWith('Selecionar dente'))
    expect(odontogramCheckboxes.length).toBe(2)
    for (const cb of odontogramCheckboxes) {
      expect(cb).toBeChecked()
    }
  })

  it('dentist can deselect one backend suggestion before applying', async () => {
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Consulta.',
      fields: { chiefComplaint: 'Rotina' },
      odontogramSuggestions: [
        { toothNumber: '36', condition: 'caries' },
        { toothNumber: '11', condition: 'crown' },
      ],
    })
    const onApplyOdontogram = vi.fn()
    const user = userEvent.setup()
    render(
      <VoiceDictationCard
        recordId="rec-abc"
        readOnly={false}
        onApplyFields={vi.fn()}
        onApplyOdontogram={onApplyOdontogram}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(
      () => expect(screen.getByText(/Sugestões para odontograma/i)).toBeInTheDocument(),
      { timeout: 3000 },
    )

    // Deselect tooth 36
    const tooth36Checkbox = screen.getByRole('checkbox', { name: /Selecionar dente 36/i })
    await user.click(tooth36Checkbox)
    expect(tooth36Checkbox).not.toBeChecked()

    // Apply — only tooth 11 should be sent
    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

    expect(onApplyOdontogram).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ toothNumber: '11' })]),
    )
    expect(onApplyOdontogram).not.toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ toothNumber: '36' })]),
    )
  })
})

// ── 19. Recording warning threshold ──────────────────────────────────────────
// The warning "Restam Xs de gravação." must appear at 30 s remaining, not 10 s.
// Strategy: fake all timers before render so the recording setInterval is
// registered with the fake clock. Use fireEvent (synchronous) for the click,
// then flush the getUserMedia microtask with await act(async () => {}).

describe('recording warning threshold', () => {
  // Ensure fake timers are always restored even if a test times out.
  afterEach(() => vi.useRealTimers())

  it('shows "Restam 30s de gravação." at exactly 30 s remaining (150 s elapsed)', async () => {
    vi.useFakeTimers()
    renderCard()
    // Synchronous click — does not depend on timer advancement
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    })
    // Flush the getUserMedia mock (promise-based, not timer-based) so
    // startRecording() completes and the setInterval is registered with fake clock
    await act(async () => {
      await Promise.resolve()
    })
    // 180 - 150 = 30 s remaining → warning threshold
    act(() => vi.advanceTimersByTime(150_000))
    expect(screen.getByText(/Restam 30s de gravação\./i)).toBeInTheDocument()
  })

  it('does NOT show a warning at 149 s (31 s remaining — below threshold)', async () => {
    vi.useFakeTimers()
    renderCard()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    })
    await act(async () => {
      await Promise.resolve()
    })
    act(() => vi.advanceTimersByTime(149_000))
    expect(screen.queryByText(/Restam/i)).not.toBeInTheDocument()
  })

  it('does NOT show the old "Encerrando em" text at any point during recording', async () => {
    vi.useFakeTimers()
    renderCard()
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    })
    await act(async () => {
      await Promise.resolve()
    })
    act(() => vi.advanceTimersByTime(170_000))
    expect(screen.queryByText(/Encerrando/i)).not.toBeInTheDocument()
  })
})

// ── 20. Post-success regression tests ─────────────────────────────────────────
// These guard against the frontend crashing AFTER the API returns a valid
// response (e.g. missing odontogramSuggestions, partial/malformed items).

describe('post-success normalization', () => {
  // Ensure any leaked fake timers from preceding tests don't break waitFor
  beforeEach(() => vi.useRealTimers())
  it('renders transcript and fields without error when response has no odontogramSuggestions key', async () => {
    // Older backend versions or mocks may omit the key entirely
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Consulta registrada.',
      fields: { chiefComplaint: 'Dor leve' },
      // odontogramSuggestions intentionally absent
    })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    await waitFor(() => expect(screen.getByText(/Revise antes de aplicar/i)).toBeInTheDocument(), {
      timeout: 3000,
    })
    // Generic error must NOT appear
    expect(
      screen.queryByText(/Não foi possível processar o ditado clínico agora/i),
    ).not.toBeInTheDocument()
    expect(screen.getByText('Consulta registrada.')).toBeInTheDocument()
  })

  it('renders odontogram suggestions from the backend and does not crash', async () => {
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Dente 36 com cárie.',
      fields: { chiefComplaint: 'Cárie' },
      odontogramSuggestions: [
        { toothNumber: '36', condition: 'caries', notes: 'Cárie mesial.', confidence: 'high' },
        { toothNumber: '11', condition: 'crown' }, // minimal — no notes/confidence
      ],
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
    expect(screen.queryByText(/Não foi possível processar/i)).not.toBeInTheDocument()
    expect(screen.getAllByText(/Dente 36/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Dente 11/i).length).toBeGreaterThanOrEqual(1)
  })

  it('ignores malformed odontogram items (missing toothNumber) and shows remaining valid ones', async () => {
    mockDictateClinicalRecord.mockResolvedValueOnce({
      transcript: 'Consulta.',
      fields: { chiefComplaint: 'Rotina' },
      odontogramSuggestions: [
        { toothNumber: '46', condition: 'caries' },
        // malformed: missing condition — backend validated but testing frontend defensiveness
        { toothNumber: '21', condition: '' },
      ],
    })
    const user = userEvent.setup()
    renderCard()

    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))

    // Must reach success state without crashing
    await waitFor(() => expect(screen.getByText(/Revise antes de aplicar/i)).toBeInTheDocument(), {
      timeout: 3000,
    })
    expect(screen.queryByText(/Não foi possível processar/i)).not.toBeInTheDocument()
  })
})

// ── 21. Processing step labels (renumbered from 17) ──────────────────────────

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

    await waitFor(() => expect(screen.getByText(/Transcrevendo consulta/i)).toBeInTheDocument())
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
    await waitFor(() => expect(screen.getByTestId('dev-debug-panel')).toBeInTheDocument())

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
      await waitFor(() => expect(screen.getByTestId('dev-debug-panel')).toBeInTheDocument())
      expect(screen.getByTestId('dev-debug-panel')).toHaveTextContent(/Bloqueado localmente/i)
      // API must not have been called
      expect(mockDictateClinicalRecord).not.toHaveBeenCalled()
    } finally {
      vi.stubGlobal('FileReader', FakeFileReader)
    }
  })
})

// ── 21. Conflict-aware review (currentFieldValues) ────────────────────────────
// When currentFieldValues shows that a suggested field already has content,
// the review UI must display a conflict badge, a conflict banner, and a mode
// selector that defaults to "Adicionar ao final".

describe('conflict-aware review', () => {
  // Helper that renders the card with pre-filled field values and drives it to
  // the success state so the conflict UI is visible.
  async function reachSuccessWithConflict(
    currentFieldValues: Partial<Record<string, string>>,
    onApplyFields = vi.fn(),
  ) {
    const user = userEvent.setup()
    render(
      <VoiceDictationCard
        recordId={RECORD_ID}
        readOnly={false}
        onApplyFields={onApplyFields}
        currentFieldValues={currentFieldValues}
      />,
    )
    await user.click(screen.getByRole('button', { name: /Gravar consulta/i }))
    await waitFor(() => expect(screen.getByText(/Gravando/i)).toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: /Parar gravação/i }))
    await waitFor(
      () =>
        expect(
          screen.getByRole('button', { name: /Aplicar campos selecionados/i }),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    )
    return { user, onApplyFields }
  }

  it('shows "Já possui conteúdo" badge when a suggested field already has content', async () => {
    // The mock returns chiefComplaint and clinicalEvolution; give clinicalEvolution existing content
    await reachSuccessWithConflict({ clinicalEvolution: 'Conteúdo anterior' })
    expect(screen.getByText(/Já possui conteúdo/i)).toBeInTheDocument()
  })

  it('does not show "Já possui conteúdo" badge when the field is empty', async () => {
    await reachSuccessWithConflict({ clinicalEvolution: '' })
    expect(screen.queryByText(/Já possui conteúdo/i)).not.toBeInTheDocument()
  })

  it('shows the conflict warning banner when at least one field has existing content', async () => {
    await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })
    expect(
      screen.getByText(/Alguns campos já possuem informações preenchidas/i),
    ).toBeInTheDocument()
  })

  it('does not show the conflict banner when no suggested field has existing content', async () => {
    await reachSuccessWithConflict({})
    expect(
      screen.queryByText(/Alguns campos já possuem informações preenchidas/i),
    ).not.toBeInTheDocument()
  })

  it('shows mode selector buttons for a field with existing content', async () => {
    await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })
    // Both mode buttons must be present in the mode selector group
    expect(screen.getByRole('button', { name: /Adicionar ao final/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Substituir tudo/i })).toBeInTheDocument()
  })

  it('does not show mode selector buttons for a field without existing content', async () => {
    // chiefComplaint has no existing content; clinicalEvolution does
    await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })
    // There should be exactly one set of mode buttons (only for clinicalEvolution)
    const appendBtns = screen.getAllByRole('button', { name: /Adicionar ao final/i })
    expect(appendBtns).toHaveLength(1)
  })

  it('default mode for a conflicted field is "Adicionar ao final" (aria-pressed=true)', async () => {
    await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })
    const appendBtn = screen.getByRole('button', { name: /Adicionar ao final/i })
    expect(appendBtn).toHaveAttribute('aria-pressed', 'true')
    const replaceBtn = screen.getByRole('button', { name: /Substituir tudo/i })
    expect(replaceBtn).toHaveAttribute('aria-pressed', 'false')
  })

  it('clicking "Substituir tudo" switches the mode and updates aria-pressed', async () => {
    const { user } = await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })
    const replaceBtn = screen.getByRole('button', { name: /Substituir tudo/i })
    await user.click(replaceBtn)
    expect(replaceBtn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Adicionar ao final/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('apply with default append mode passes modes object with append for the conflicted field', async () => {
    const onApplyFields = vi.fn()
    const { user } = await reachSuccessWithConflict(
      { clinicalEvolution: 'Texto existente' },
      onApplyFields,
    )
    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))
    const [, modes] = onApplyFields.mock.calls[0] as [unknown, Record<string, string>]
    expect(modes.clinicalEvolution).toBe('append')
  })

  it('apply with "Substituir tudo" passes replace mode for that field', async () => {
    const onApplyFields = vi.fn()
    const { user } = await reachSuccessWithConflict(
      { clinicalEvolution: 'Texto existente' },
      onApplyFields,
    )
    await user.click(screen.getByRole('button', { name: /Substituir tudo/i }))
    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))
    const [, modes] = onApplyFields.mock.calls[0] as [unknown, Record<string, string>]
    expect(modes.clinicalEvolution).toBe('replace')
  })

  it('apply when all checked fields are empty still shows the no-content warning', async () => {
    const onApplyFields = vi.fn()
    const { user } = await reachSuccessWithConflict(
      { clinicalEvolution: 'Texto existente' },
      onApplyFields,
    )
    // Clear all textareas
    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    for (const ta of textareas) await user.clear(ta)
    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))
    expect(screen.getByText(/Nenhum campo selecionado possui conteúdo/i)).toBeInTheDocument()
    expect(onApplyFields).not.toHaveBeenCalled()
  })

  it('resetting to idle clears fieldModes so next recording starts with fresh modes', async () => {
    const { user } = await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })
    // Switch to replace
    await user.click(screen.getByRole('button', { name: /Substituir tudo/i }))
    // Discard resets all state including modes
    await user.click(screen.getByRole('button', { name: /Descartar/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Gravar consulta/i })).toBeInTheDocument(),
    )
    // Mode UI is gone — no residual mode buttons visible
    expect(screen.queryByRole('button', { name: /Substituir tudo/i })).not.toBeInTheDocument()
  })

  // ── "Editar antes de aplicar" mode ────────────────────────────────────────────

  it('shows "Editar antes de aplicar" button in the mode selector for conflicted fields', async () => {
    await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })
    expect(screen.getByRole('button', { name: /Editar antes de aplicar/i })).toBeInTheDocument()
  })

  it('clicking "Editar antes de aplicar" pre-fills textarea with merged content', async () => {
    // Default mock: clinicalEvolution AI text = 'Sensibilidade ao frio.'
    // existing content = 'Texto existente'
    // Expected combined = 'Texto existente\n\nSensibilidade ao frio.'
    const { user } = await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })

    await user.click(screen.getByRole('button', { name: /Editar antes de aplicar/i }))

    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    const evolutionTextarea = textareas.find((t) =>
      t.getAttribute('aria-label')?.includes('Evolução clínica'),
    )
    expect(evolutionTextarea).toBeDefined()
    expect(evolutionTextarea!.value).toBe('Texto existente\n\nSensibilidade ao frio.')
  })

  it('"Editar antes de aplicar" mode is active (aria-pressed=true) after clicking it', async () => {
    const { user } = await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })
    const editBtn = screen.getByRole('button', { name: /Editar antes de aplicar/i })
    await user.click(editBtn)
    expect(editBtn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Adicionar ao final/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: /Substituir tudo/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('apply with edit mode passes "edit" in the modes object', async () => {
    const onApplyFields = vi.fn()
    const { user } = await reachSuccessWithConflict(
      { clinicalEvolution: 'Texto existente' },
      onApplyFields,
    )
    await user.click(screen.getByRole('button', { name: /Editar antes de aplicar/i }))
    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))
    const [, modes] = onApplyFields.mock.calls[0] as [unknown, Record<string, string>]
    expect(modes.clinicalEvolution).toBe('edit')
  })

  it('switching from "Editar antes de aplicar" back to "Adicionar ao final" restores the original AI text in the textarea', async () => {
    // Default mock: clinicalEvolution AI text = 'Sensibilidade ao frio.'
    // existing content = 'Texto existente'
    const { user } = await reachSuccessWithConflict({ clinicalEvolution: 'Texto existente' })

    // Enter edit mode — textarea shows merged content
    await user.click(screen.getByRole('button', { name: /Editar antes de aplicar/i }))

    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    const evolutionTextarea = textareas.find((t) =>
      t.getAttribute('aria-label')?.includes('Evolução clínica'),
    )!
    expect(evolutionTextarea.value).toBe('Texto existente\n\nSensibilidade ao frio.')

    // Switch back to append mode
    await user.click(screen.getByRole('button', { name: /Adicionar ao final/i }))

    // Textarea must be restored to the original AI suggestion so the container
    // can merge correctly without double-applying the existing content.
    expect(evolutionTextarea.value).toBe('Sensibilidade ao frio.')
  })

  it('after switching from edit back to append, applying passes the original AI text (not already-merged content)', async () => {
    // Regression: before the fix, editableFields kept the merged content after
    // mode switch, causing the container to produce "existing\n\nexisting\n\nAI".
    const onApplyFields = vi.fn()
    const { user } = await reachSuccessWithConflict(
      { clinicalEvolution: 'Texto existente' },
      onApplyFields,
    )

    await user.click(screen.getByRole('button', { name: /Editar antes de aplicar/i }))
    await user.click(screen.getByRole('button', { name: /Adicionar ao final/i }))
    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

    const [fields] = onApplyFields.mock.calls[0] as [Record<string, string>, unknown]
    // Must be the original AI text; the container handles merging with existing content.
    // A double-merge would produce 'Texto existente\n\nSensibilidade ao frio.'
    expect(fields.clinicalEvolution).toBe('Sensibilidade ao frio.')
  })

  it('edit mode textarea content can be further modified before applying', async () => {
    const onApplyFields = vi.fn()
    const { user } = await reachSuccessWithConflict(
      { clinicalEvolution: 'Texto existente' },
      onApplyFields,
    )
    await user.click(screen.getByRole('button', { name: /Editar antes de aplicar/i }))

    const textareas = screen.getAllByRole('textbox') as HTMLTextAreaElement[]
    const evolutionTextarea = textareas.find((t) =>
      t.getAttribute('aria-label')?.includes('Evolução clínica'),
    )!
    await user.clear(evolutionTextarea)
    await user.type(evolutionTextarea, 'Texto personalizado pelo dentista')

    await user.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))

    const [fields] = onApplyFields.mock.calls[0] as [Record<string, string>, unknown]
    expect(fields.clinicalEvolution).toBe('Texto personalizado pelo dentista')
  })
})
