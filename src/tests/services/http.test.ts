import { notifySessionExpired } from '@/features/auth/utils/auth-events'
import { clearSession } from '@/features/auth/utils/session-storage'
import { ApiError, apiRequest, setupAuthRefresh } from '@/services/http'

// ── Mocks ─────────────────────────────────────────────────────────────────────

let mockApiUrl: string | undefined = 'http://localhost:3000'

vi.mock('@/config/env', () => ({
  env: {
    get apiUrl() {
      return mockApiUrl
    },
  },
}))

// Stub session-storage and auth-events defensively — only used in the 401
// refresh path, which is not exercised in this block.
vi.mock('@/features/auth/utils/session-storage', () => ({ clearSession: vi.fn() }))
vi.mock('@/features/auth/utils/auth-events', () => ({ notifySessionExpired: vi.fn() }))

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeJsonResponse(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

const mockFetch = vi.fn()
let savedLocation: Location

beforeEach(() => {
  vi.clearAllMocks()
  mockApiUrl = 'http://localhost:3000'
  vi.useFakeTimers()
  vi.stubGlobal('fetch', mockFetch)
  savedLocation = window.location
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  Object.defineProperty(window, 'location', {
    value: savedLocation,
    configurable: true,
    writable: true,
  })
})

// ── Successful responses ──────────────────────────────────────────────────────

describe('successful responses', () => {
  it('returns the parsed JSON body for a 200 response', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(200, { id: 'clinic-1', name: 'Test' }))
    const result = await apiRequest<{ id: string; name: string }>('/test')
    expect(result).toEqual({ id: 'clinic-1', name: 'Test' })
  })

  it('returns undefined for a 204 No Content response', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 204 }))
    const result = await apiRequest<undefined>('/test')
    expect(result).toBeUndefined()
  })
})

// ── 402 Payment Required ──────────────────────────────────────────────────────

describe('402 Payment Required', () => {
  it('throws an ApiError with status 402', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(402, { message: 'Subscription required' }))
    await expect(apiRequest('/test')).rejects.toMatchObject({
      name: 'ApiError',
      status: 402,
    })
  })

  it('throws with the hardcoded subscription prompt message', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(402, { message: 'Subscription required' }))
    await expect(apiRequest('/test')).rejects.toThrow(
      'Escolha um plano para continuar usando o DentalFlow.',
    )
  })

  it('schedules window.location.replace("/app/assinatura") when not already on the subscription page', async () => {
    const replaceSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { replace: replaceSpy, pathname: '/app/agendamentos' },
      configurable: true,
      writable: true,
    })
    mockFetch.mockResolvedValue(makeJsonResponse(402, { message: 'Subscription required' }))

    await expect(apiRequest('/test')).rejects.toBeInstanceOf(ApiError)

    vi.runAllTimers()
    expect(replaceSpy).toHaveBeenCalledOnce()
    expect(replaceSpy).toHaveBeenCalledWith('/app/assinatura')
  })

  it('does not call window.location.replace when already on /app/assinatura', async () => {
    const replaceSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { replace: replaceSpy, pathname: '/app/assinatura' },
      configurable: true,
      writable: true,
    })
    mockFetch.mockResolvedValue(makeJsonResponse(402, { message: 'Subscription required' }))

    await expect(apiRequest('/test')).rejects.toBeInstanceOf(ApiError)

    vi.runAllTimers()
    expect(replaceSpy).not.toHaveBeenCalled()
  })
})

// ── Non-402 server errors ─────────────────────────────────────────────────────

describe('non-402 server errors', () => {
  it('throws ApiError for a 500 response without redirecting', async () => {
    const replaceSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { replace: replaceSpy, pathname: '/app/agendamentos' },
      configurable: true,
      writable: true,
    })
    mockFetch.mockResolvedValue(makeJsonResponse(500, { message: 'Internal Server Error' }))

    await expect(apiRequest('/test')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
    })

    vi.runAllTimers()
    expect(replaceSpy).not.toHaveBeenCalled()
  })

  it('throws ApiError for a 403 response', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(403, { message: 'Forbidden' }))
    await expect(apiRequest('/test')).rejects.toMatchObject({
      name: 'ApiError',
      status: 403,
    })
  })

  it('falls back to the generic message when the status has no mapping and the body has no message', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(418, {}))
    await expect(apiRequest('/test')).rejects.toMatchObject({
      name: 'ApiError',
      status: 418,
      message: 'Erro ao comunicar com o servidor.',
    })
  })
})

// ── Network errors ────────────────────────────────────────────────────────────

describe('network errors', () => {
  it('throws ApiError with status 0 when fetch throws a TypeError', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(apiRequest('/test')).rejects.toMatchObject({
      name: 'ApiError',
      status: 0,
    })
  })
})

// ── Missing env.apiUrl ────────────────────────────────────────────────────────

describe('missing env.apiUrl', () => {
  it('throws immediately when env.apiUrl is not configured', async () => {
    mockApiUrl = undefined
    await expect(apiRequest('/test')).rejects.toThrow('VITE_API_URL não está configurada.')
    expect(mockFetch).not.toHaveBeenCalled()
  })
})

// ── Success body parsing ──────────────────────────────────────────────────────

describe('success body parsing', () => {
  it('returns raw text for a non-JSON content type', async () => {
    mockFetch.mockResolvedValue(
      new Response('plain text body', { status: 200, headers: { 'Content-Type': 'text/plain' } }),
    )
    const result = await apiRequest<string>('/test')
    expect(result).toBe('plain text body')
  })

  it('returns undefined for an empty (whitespace-only) body', async () => {
    mockFetch.mockResolvedValue(
      new Response('   ', { status: 200, headers: { 'Content-Type': 'application/json' } }),
    )
    const result = await apiRequest('/test')
    expect(result).toBeUndefined()
  })

  it('throws an ApiError when the JSON body cannot be parsed', async () => {
    mockFetch.mockResolvedValue(
      new Response('{not valid json', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    await expect(apiRequest('/test')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'A resposta do servidor veio em um formato inválido.',
    })
  })
})

// ── Error body parsing ────────────────────────────────────────────────────────

describe('error body parsing', () => {
  it('parses a non-JSON error body as text', async () => {
    mockFetch.mockResolvedValue(
      new Response('server error text', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      }),
    )
    await expect(apiRequest('/test')).rejects.toMatchObject({ status: 500 })
  })

  it('falls back to null body when the JSON error body cannot be parsed', async () => {
    mockFetch.mockResolvedValue(
      new Response('{not valid json', {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const error = await apiRequest('/test').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as InstanceType<typeof ApiError>).body).toBeNull()
  })

  it('joins an array message into a single translated string', async () => {
    mockFetch.mockResolvedValue(
      makeJsonResponse(400, { message: ['page must not be less than 1'] }),
    )
    await expect(apiRequest('/test')).rejects.toThrow('Página deve ser maior ou igual a 1.')
  })

  it('falls back to the error field when message is absent', async () => {
    mockFetch.mockResolvedValue(makeJsonResponse(403, { error: 'Forbidden' }))
    await expect(apiRequest('/test')).rejects.toMatchObject({ status: 403 })
  })
})

// ── Request timeout / abort ───────────────────────────────────────────────────

describe('external abort signal', () => {
  it('aborts the request when the caller-provided signal aborts', async () => {
    const externalController = new AbortController()
    mockFetch.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          })
        }),
    )

    const promise = apiRequest('/test', { signal: externalController.signal })
    const assertion = expect(promise).rejects.toMatchObject({ status: 408 })
    externalController.abort()
    await assertion
  })
})

describe('request timeout', () => {
  it('throws an ApiError with status 408 when the request times out', async () => {
    mockFetch.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          })
        }),
    )

    const promise = apiRequest('/test', { timeoutMs: 1000 })
    const assertion = expect(promise).rejects.toMatchObject({
      status: 408,
      message: 'A requisição demorou muito. Tente novamente.',
    })
    await vi.advanceTimersByTimeAsync(1000)
    await assertion
  })
})

// ── 401 refresh flow ──────────────────────────────────────────────────────────

describe('401 refresh flow', () => {
  it('shares one refresh across concurrent unauthorized requests and retries both with the new token', async () => {
    let resolveRefresh: (value: { accessToken: string }) => void = () => {}
    const refreshTokens = vi.fn(
      () =>
        new Promise<{ accessToken: string }>((resolve) => {
          resolveRefresh = resolve
        }),
    )
    setupAuthRefresh({ refreshTokens, onTokenRefreshed: vi.fn(), onRefreshFailed: vi.fn() })
    mockFetch.mockImplementation((_url: string, options: RequestInit) => {
      const authorization = new Headers(options.headers).get('Authorization')
      return Promise.resolve(
        makeJsonResponse(authorization === 'Bearer refreshed' ? 200 : 401, {
          ok: authorization === 'Bearer refreshed',
        }),
      )
    })
    const first = apiRequest('/first', { accessToken: 'expired' })
    const second = apiRequest('/second', { accessToken: 'expired' })
    await vi.waitFor(() => expect(refreshTokens).toHaveBeenCalledOnce())
    resolveRefresh({ accessToken: 'refreshed' })
    await expect(Promise.all([first, second])).resolves.toEqual([{ ok: true }, { ok: true }])
    expect(refreshTokens).toHaveBeenCalledOnce()
    expect(mockFetch).toHaveBeenCalledTimes(4)
    expect(notifySessionExpired).not.toHaveBeenCalled()
  })
  it('refreshes the token and retries the request on success', async () => {
    const onTokenRefreshed = vi.fn()
    const onRefreshFailed = vi.fn()
    setupAuthRefresh({
      refreshTokens: vi.fn().mockResolvedValue({ accessToken: 'new-token' }),
      onTokenRefreshed,
      onRefreshFailed,
    })

    mockFetch
      .mockResolvedValueOnce(makeJsonResponse(401, { message: 'Unauthorized' }))
      .mockResolvedValueOnce(makeJsonResponse(200, { ok: true }))

    const result = await apiRequest<{ ok: boolean }>('/test')

    expect(result).toEqual({ ok: true })
    expect(onTokenRefreshed).toHaveBeenCalledWith('new-token')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('clears the session and rejects when the refresh itself fails', async () => {
    const onTokenRefreshed = vi.fn()
    const onRefreshFailed = vi.fn()
    setupAuthRefresh({
      refreshTokens: vi.fn().mockRejectedValue(new Error('refresh failed')),
      onTokenRefreshed,
      onRefreshFailed,
    })

    mockFetch.mockResolvedValue(makeJsonResponse(401, { message: 'Unauthorized' }))

    await expect(apiRequest('/test')).rejects.toMatchObject({ status: 401 })

    expect(clearSession).toHaveBeenCalledOnce()
    expect(notifySessionExpired).toHaveBeenCalledOnce()
    expect(onRefreshFailed).toHaveBeenCalledOnce()
    expect(onTokenRefreshed).not.toHaveBeenCalled()
  })

  it('does not attempt a refresh when _skipRefresh is set', async () => {
    const refreshTokens = vi.fn()
    setupAuthRefresh({
      refreshTokens,
      onTokenRefreshed: vi.fn(),
      onRefreshFailed: vi.fn(),
    })

    mockFetch.mockResolvedValue(makeJsonResponse(401, { message: 'Unauthorized' }))

    await expect(apiRequest('/test', { _skipRefresh: true })).rejects.toMatchObject({
      status: 401,
    })
    expect(refreshTokens).not.toHaveBeenCalled()
  })
})

it('uses the production connection error without exposing development API instructions', async () => {
  vi.stubEnv('PROD', true)
  mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))
  await expect(apiRequest('/test')).rejects.toMatchObject({
    status: 0,
    message: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
  })
})

it('falls back to the HTTP status when a JSON error body contains no message', async () => {
  mockFetch.mockResolvedValueOnce(makeJsonResponse(404, { statusCode: 404 }))
  await expect(apiRequest('/test')).rejects.toMatchObject({
    status: 404,
    message: 'Recurso não encontrado.',
  })
})
