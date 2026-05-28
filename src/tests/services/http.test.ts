import { ApiError, apiRequest } from '@/services/http'

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
