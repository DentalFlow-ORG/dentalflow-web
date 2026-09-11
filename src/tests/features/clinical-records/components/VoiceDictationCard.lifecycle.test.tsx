import { VoiceDictationCard } from '@/features/clinical-records/components/VoiceDictationCard'
import { dictateClinicalRecord } from '@/features/clinical-records/services/clinical-dictation.service'
import {
  FakeFileReader,
  FakeMediaRecorder,
  latestRecorder,
  resetMediaRecorder,
} from '@/test-utils/mocks/clinical-media'
import { act, fireEvent, renderWithProviders, screen } from '@/test-utils/render-utils'

const showAlert = vi.fn()
const getUserMedia = vi.fn()
const stopTrack = vi.fn()
const originalMediaDevices = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices')
const response = {
  transcript: 'Consulta revisada',
  fields: { chiefComplaint: 'Sensibilidade' },
  odontogramSuggestions: [],
}
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert }),
}))
vi.mock('@/features/billing/services/billing-status-cache', () => ({
  getCachedBillingStatus: () => ({ planKey: 'premium', accessAllowed: true }),
}))
vi.mock('@/features/clinical-records/services/clinical-dictation.service', () => ({
  dictateClinicalRecord: vi.fn(),
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  resetMediaRecorder()
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
  vi.stubGlobal('FileReader', FakeFileReader)
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } })
  getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] })
  vi.mocked(dictateClinicalRecord).mockResolvedValue(response)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  if (originalMediaDevices) Object.defineProperty(navigator, 'mediaDevices', originalMediaDevices)
  else Reflect.deleteProperty(navigator, 'mediaDevices')
})

async function record() {
  const view = renderWithProviders(
    <VoiceDictationCard recordId="record-1" readOnly={false} onApplyFields={vi.fn()} />,
  )
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gravar consulta' })))
  return view
}

async function stop() {
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Parar gravação' })))
  await act(async () => vi.advanceTimersByTimeAsync(0))
}

it('explains missing media-device support without requesting microphone access', async () => {
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined })
  await record()
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Seu navegador não suporta gravação de áudio.',
  )
  expect(getUserMedia).not.toHaveBeenCalled()
  expect(dictateClinicalRecord).not.toHaveBeenCalled()
})

it('prevents a second microphone request while permission is pending', async () => {
  const permission = deferred<{ getTracks: () => { stop: typeof stopTrack }[] }>()
  getUserMedia.mockReturnValueOnce(permission.promise)
  await record()
  const start = screen.getByRole('button')
  fireEvent.click(start)
  expect(getUserMedia).toHaveBeenCalledOnce()
  expect(start).toBeDisabled()
  await act(async () => permission.resolve({ getTracks: () => [{ stop: stopTrack }] }))
  expect(screen.getByRole('button', { name: 'Parar gravação' })).toBeEnabled()
  await stop()
  expect(dictateClinicalRecord).toHaveBeenCalledOnce()
})

it.each([null, new Error('device busy')])(
  'recovers from an unrecognized microphone error: %s',
  async (error) => {
    getUserMedia.mockRejectedValueOnce(error)
    await record()
    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível iniciar a gravação.')
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gravar consulta' })))
    expect(screen.getByRole('button', { name: 'Parar gravação' })).toBeEnabled()
    await stop()
    expect(dictateClinicalRecord).toHaveBeenCalledOnce()
  },
)

it.each([true, false])(
  'uploads using a fallback when the recorder reports no MIME (preferred available=%s)',
  async (supported) => {
    class RecorderWithoutMime extends FakeMediaRecorder {
      mimeType = ''
    }
    vi.stubGlobal('MediaRecorder', RecorderWithoutMime)
    FakeMediaRecorder.isTypeSupported.mockReturnValue(supported)
    await record()
    await stop()
    expect(dictateClinicalRecord).toHaveBeenCalledWith(
      'record-1',
      expect.objectContaining({
        mimeType: supported ? 'audio/webm;codecs=opus' : 'audio/webm',
      }),
    )
  },
)

it('ignores empty chunks and a duplicate stop notification without duplicate transcription', async () => {
  await record()
  const recorder = latestRecorder
  if (!recorder) throw new Error('Recorder not started')
  await act(async () => recorder.ondataavailable?.({ data: new Blob([]), size: 0 }))
  await stop()
  await act(async () => recorder.onstop?.())
  expect(dictateClinicalRecord).toHaveBeenCalledOnce()
  expect(screen.getByText('Consulta revisada')).toBeInTheDocument()
  expect(showAlert).not.toHaveBeenCalled()
})

it('reselects a tooth and applies odontogram-only suggestions without modifying clinical text', async () => {
  vi.mocked(dictateClinicalRecord).mockResolvedValue({
    transcript: 'Consulta',
    fields: {},
    odontogramSuggestions: [{ toothNumber: '36', condition: 'caries' }],
  })
  const onApplyFields = vi.fn()
  const onApplyOdontogram = vi.fn()
  renderWithProviders(
    <VoiceDictationCard
      recordId="record-1"
      readOnly={false}
      onApplyFields={onApplyFields}
      onApplyOdontogram={onApplyOdontogram}
    />,
  )
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gravar consulta' })))
  await stop()
  const tooth = screen.getByRole('checkbox', { name: /Selecionar dente 36/i })
  fireEvent.click(tooth)
  expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeDisabled()
  fireEvent.click(tooth)
  fireEvent.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))
  expect(onApplyFields).not.toHaveBeenCalled()
  expect(onApplyOdontogram).toHaveBeenCalledWith([
    expect.objectContaining({ toothNumber: '36', condition: 'caries' }),
  ])
})

it('expands and collapses a long transcript without changing its content', async () => {
  const transcript = 'Relato detalhado da consulta. '.repeat(40)
  vi.mocked(dictateClinicalRecord).mockResolvedValue({ ...response, transcript })
  await record()
  await stop()
  const expand = screen.getByRole('button', { name: 'Ver mais' })
  expect(expand).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(expand)
  expect(screen.getByRole('button', { name: 'Ver menos' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByText(transcript.trim())).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Ver menos' }))
  expect(screen.getByRole('button', { name: 'Ver mais' })).toHaveAttribute('aria-expanded', 'false')
})

it('restores a deselected suggested field so it can be applied again', async () => {
  await record()
  await stop()
  const field = screen.getByRole('checkbox')
  fireEvent.click(field)
  expect(field).not.toBeChecked()
  expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeDisabled()
  fireEvent.click(field)
  expect(field).toBeChecked()
  expect(screen.getByRole('button', { name: /Aplicar campos selecionados/i })).toBeEnabled()
})

it('automatically stops once at 180 seconds and sends the recorded duration', async () => {
  await record()
  await act(async () => vi.advanceTimersByTimeAsync(179_000))
  expect(screen.getByRole('button', { name: 'Parar gravação' })).toBeEnabled()
  expect(dictateClinicalRecord).not.toHaveBeenCalled()
  await act(async () => vi.advanceTimersByTimeAsync(1_000))
  expect(dictateClinicalRecord).toHaveBeenCalledExactlyOnceWith('record-1', {
    audioBase64: 'ZmFrZQ==',
    mimeType: 'audio/webm',
    durationSeconds: 180,
  })
  expect(screen.getByText('Consulta revisada')).toBeInTheDocument()
  expect(stopTrack).toHaveBeenCalled()
  await act(async () => vi.advanceTimersByTimeAsync(60_000))
  expect(dictateClinicalRecord).toHaveBeenCalledOnce()
})

it.each(['invalid-result', 'empty-payload', 'read-error'])(
  'recovers from %s without uploading invalid audio',
  async (failure) => {
    vi.spyOn(FakeFileReader.prototype, 'readAsDataURL').mockImplementation(function (
      this: FakeFileReader,
    ) {
      if (failure === 'read-error') this.onerror?.()
      else {
        this.result = failure === 'invalid-result' ? null : 'data:audio/webm;base64,'
        this.onloadend?.()
      }
    })
    await record()
    await stop()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível processar o ditado clínico agora.',
    )
    expect(dictateClinicalRecord).not.toHaveBeenCalled()
    expect(stopTrack).toHaveBeenCalled()
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' })))
    expect(screen.getByRole('button', { name: 'Gravar consulta' })).toBeEnabled()
  },
)

it('explains a missing microphone instead of attempting transcription', async () => {
  getUserMedia.mockRejectedValueOnce(
    Object.assign(new Error('No device'), { name: 'NotFoundError' }),
  )
  await record()
  expect(screen.getByRole('alert')).toHaveTextContent('Nenhum microfone encontrado.')
  expect(dictateClinicalRecord).not.toHaveBeenCalled()
})

it('supports browsers without MediaRecorder with an actionable error', async () => {
  vi.stubGlobal('MediaRecorder', undefined)
  await record()
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Gravação de áudio não é suportada neste navegador.',
  )
  expect(getUserMedia).not.toHaveBeenCalled()
})

it.each(['resolve', 'reject'])(
  'ignores a late API %s after the processing timeout and retry',
  async (completion) => {
    const pending = deferred<typeof response>()
    vi.mocked(dictateClinicalRecord).mockReturnValueOnce(pending.promise)
    await record()
    await stop()
    await act(async () => vi.advanceTimersByTimeAsync(6_000))
    expect(screen.getByText('Organizando nos campos clínicos…')).toBeInTheDocument()
    await act(async () => vi.advanceTimersByTimeAsync(39_000))
    expect(screen.getByRole('alert')).toHaveTextContent('O processamento demorou muito.')
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' })))
    await act(async () => {
      if (completion === 'resolve') pending.resolve(response)
      else pending.reject(new Error('late failure'))
    })
    expect(screen.getByRole('button', { name: 'Gravar consulta' })).toBeEnabled()
    expect(showAlert).toHaveBeenCalledOnce()
    expect(screen.queryByText('Consulta revisada')).not.toBeInTheDocument()
  },
)

it.each(['resolve', 'reject'] as const)(
  'does not let an expired recording %s overwrite a new successful recording',
  async (outcome) => {
    const old = deferred<typeof response>()
    vi.mocked(dictateClinicalRecord)
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce({ ...response, transcript: 'Nova consulta' })
    await record()
    await stop()
    await act(async () => vi.advanceTimersByTimeAsync(45_000))
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gravar consulta' })))
    await stop()
    expect(screen.getByText('Nova consulta')).toBeInTheDocument()
    showAlert.mockClear()
    await act(async () => {
      if (outcome === 'resolve') old.resolve(response)
      else old.reject(new Error('old request failed'))
    })
    expect(screen.getByText('Nova consulta')).toBeInTheDocument()
    expect(screen.queryByText('Consulta revisada')).not.toBeInTheDocument()
    expect(showAlert).not.toHaveBeenCalled()
  },
)

it.each(['resolve', 'reject'] as const)(
  'keeps the new recording timers active after an expired request %s',
  async (outcome) => {
    const old = deferred<typeof response>()
    vi.mocked(dictateClinicalRecord)
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(new Promise(() => {}))
    await record()
    await stop()
    await act(async () => vi.advanceTimersByTimeAsync(45_000))
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gravar consulta' })))
    await stop()
    await act(async () => {
      if (outcome === 'resolve') old.resolve(response)
      else old.reject(new Error('expired'))
    })
    await act(async () => vi.advanceTimersByTimeAsync(6_000))
    expect(screen.getByText('Organizando nos campos clínicos…')).toBeInTheDocument()
    await act(async () => vi.advanceTimersByTimeAsync(39_000))
    expect(screen.getByRole('alert')).toHaveTextContent('O processamento demorou muito.')
  },
)

it('does not upload a stale audio conversion after a new recording succeeds', async () => {
  let oldReader!: FakeFileReader
  vi.spyOn(FakeFileReader.prototype, 'readAsDataURL').mockImplementationOnce(function (
    this: FakeFileReader,
  ) {
    oldReader = this
  })
  await record()
  await stop()
  await act(async () => vi.advanceTimersByTimeAsync(45_000))
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gravar consulta' })))
  await stop()
  await act(async () => oldReader.onloadend?.())
  expect(dictateClinicalRecord).toHaveBeenCalledOnce()
  expect(screen.getByText('Consulta revisada')).toBeInTheDocument()
})

it('keeps a new recording active when an expired recorder delivers its stop event late', async () => {
  await record()
  const oldRecorder = latestRecorder
  if (!oldRecorder) throw new Error('Recorder not started')
  oldRecorder.stop.mockImplementation(() => {
    oldRecorder.state = 'inactive'
  })
  await stop()
  await act(async () => vi.advanceTimersByTimeAsync(5_000))
  fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gravar consulta' })))
  const newRecorder = latestRecorder
  await act(async () => oldRecorder.onstop?.())
  expect(screen.getByRole('button', { name: 'Parar gravação' })).toBeEnabled()
  expect(newRecorder?.state).toBe('recording')
  await stop()
  expect(dictateClinicalRecord).toHaveBeenCalledOnce()
})

it('does not stop an inactive recorder again while its native stop notification is pending', async () => {
  await record()
  const recorder = latestRecorder
  if (!recorder) throw new Error('Recorder not started')
  recorder.state = 'inactive'
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Parar gravação' })))
  expect(recorder.stop).not.toHaveBeenCalled()
  await act(async () => {
    recorder.ondataavailable?.({ data: new Blob(['audio']), size: 5 })
    recorder.onstop?.()
  })
  expect(dictateClinicalRecord).toHaveBeenCalledOnce()
  expect(screen.getByText('Consulta revisada')).toBeInTheDocument()
})

it('cancels progress advancement when slow audio conversion leaves too little time for transcription', async () => {
  let reader!: FakeFileReader
  vi.spyOn(FakeFileReader.prototype, 'readAsDataURL').mockImplementationOnce(function (
    this: FakeFileReader,
  ) {
    reader = this
  })
  vi.mocked(dictateClinicalRecord).mockReturnValueOnce(new Promise(() => {}))
  await record()
  await stop()
  await act(async () => vi.advanceTimersByTimeAsync(44_000))
  await act(async () => reader.onloadend?.())
  expect(screen.getByText('Transcrevendo consulta…')).toBeInTheDocument()
  await act(async () => vi.advanceTimersByTimeAsync(1_000))
  expect(screen.getByRole('alert')).toHaveTextContent('O processamento demorou muito.')
  await act(async () => vi.advanceTimersByTimeAsync(6_000))
  expect(screen.queryByText('Organizando nos campos clínicos…')).not.toBeInTheDocument()
  expect(vi.getTimerCount()).toBe(0)
})

it('keeps existing text when an optional suggested field is absent and the dentist edits before applying', async () => {
  vi.mocked(dictateClinicalRecord).mockResolvedValue({
    ...response,
    fields: { chiefComplaint: undefined },
  })
  const onApplyFields = vi.fn()
  renderWithProviders(
    <VoiceDictationCard
      recordId="record-1"
      readOnly={false}
      currentFieldValues={{ chiefComplaint: 'Queixa existente' }}
      onApplyFields={onApplyFields}
    />,
  )
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Gravar consulta' })))
  await stop()
  fireEvent.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))
  expect(onApplyFields).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Editar antes de aplicar' }))
  expect(screen.getByRole('textbox')).toHaveValue('Queixa existente')
  fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao final' }))
  expect(screen.getByRole('textbox')).toHaveValue('')
  fireEvent.click(screen.getByRole('button', { name: 'Editar antes de aplicar' }))
  fireEvent.click(screen.getByRole('button', { name: /Aplicar campos selecionados/i }))
  expect(onApplyFields).toHaveBeenCalledWith(
    { chiefComplaint: 'Queixa existente' },
    { chiefComplaint: 'edit' },
  )
})

it('does not upload after unmount during audio conversion', async () => {
  let reader: FakeFileReader | undefined
  vi.spyOn(FakeFileReader.prototype, 'readAsDataURL').mockImplementation(function (
    this: FakeFileReader,
  ) {
    reader = this
  })
  const view = await record()
  await stop()
  view.unmount()
  await act(async () => reader?.onloadend?.())
  expect(dictateClinicalRecord).not.toHaveBeenCalled()
  expect(showAlert).not.toHaveBeenCalled()
  expect(stopTrack).toHaveBeenCalled()
})

it.each(['resolve', 'reject'])(
  'does not publish notifications after an unmounted API %s',
  async (completion) => {
    const pending = deferred<typeof response>()
    vi.mocked(dictateClinicalRecord).mockReturnValueOnce(pending.promise)
    const view = await record()
    await stop()
    view.unmount()
    await act(async () => {
      if (completion === 'resolve') pending.resolve(response)
      else pending.reject(new Error('late failure'))
    })
    await act(async () => vi.advanceTimersByTimeAsync(60_000))
    expect(showAlert).not.toHaveBeenCalled()
    expect(dictateClinicalRecord).toHaveBeenCalledOnce()
  },
)

it('releases a microphone granted after navigation without starting a recorder', async () => {
  const pending = deferred<{ getTracks: () => { stop: typeof stopTrack }[] }>()
  getUserMedia.mockReturnValueOnce(pending.promise)
  const view = await record()
  view.unmount()
  await act(async () => pending.resolve({ getTracks: () => [{ stop: stopTrack }] }))
  expect(stopTrack).toHaveBeenCalledOnce()
  expect(latestRecorder).toBeNull()
  expect(dictateClinicalRecord).not.toHaveBeenCalled()
})

it('does not show microphone errors after navigation while permission was pending', async () => {
  const pending = deferred<never>()
  getUserMedia.mockReturnValueOnce(pending.promise)
  const view = await record()
  view.unmount()
  await act(async () => pending.reject(new DOMException('Denied', 'NotAllowedError')))
  expect(showAlert).not.toHaveBeenCalled()
})
