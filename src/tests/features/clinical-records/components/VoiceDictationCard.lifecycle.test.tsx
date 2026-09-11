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
