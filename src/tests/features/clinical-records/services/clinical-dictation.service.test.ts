import { dictateClinicalRecord } from '@/features/clinical-records/services/clinical-dictation.service'
import type {
  DictateClinicalRecordRequest,
  DictateClinicalRecordResponse,
} from '@/features/clinical-records/types/clinical-dictation.types'

// ── Mocks ─────────────────────────────────────────────────────────────────────
// globals: true (vitest.config.ts) — no explicit import needed for vi/describe/it/expect

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'tok-dictation')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const RECORD_ID = 'rec-abc123'

const VALID_REQUEST: DictateClinicalRecordRequest = {
  audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEA',
  mimeType: 'audio/webm',
  durationSeconds: 42,
}

const VALID_RESPONSE: DictateClinicalRecordResponse = {
  transcript: 'Paciente relata dor no dente 36 há três dias.',
  fields: {
    chiefComplaint: 'Dor no dente 36',
    clinicalEvolution: 'Sensibilidade ao frio',
  },
  odontogramSuggestions: [],
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockApiRequest.mockResolvedValue(VALID_RESPONSE)
})

// ── dictateClinicalRecord ─────────────────────────────────────────────────────

describe('dictateClinicalRecord', () => {
  it('calls POST /clinical-records/:id/dictate with the correct path', async () => {
    await dictateClinicalRecord(RECORD_ID, VALID_REQUEST)

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe(`/clinical-records/${RECORD_ID}/dictate`)
    expect(options.method).toBe('POST')
  })

  it('passes the access token from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-premium-user')
    await dictateClinicalRecord(RECORD_ID, VALID_REQUEST)

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-premium-user')
  })

  it('serializes the full payload — audioBase64, mimeType, durationSeconds — as the request body', async () => {
    await dictateClinicalRecord(RECORD_ID, VALID_REQUEST)

    const [, options] = mockApiRequest.mock.calls[0]
    expect(JSON.parse(options.body as string)).toEqual({
      audioBase64: VALID_REQUEST.audioBase64,
      mimeType: VALID_REQUEST.mimeType,
      durationSeconds: VALID_REQUEST.durationSeconds,
    })
  })

  it('omits durationSeconds from the body when it is not provided', async () => {
    const requestWithoutDuration: DictateClinicalRecordRequest = {
      audioBase64: VALID_REQUEST.audioBase64,
      mimeType: VALID_REQUEST.mimeType,
    }
    await dictateClinicalRecord(RECORD_ID, requestWithoutDuration)

    const [, options] = mockApiRequest.mock.calls[0]
    const body = JSON.parse(options.body as string) as Record<string, unknown>
    expect(body).not.toHaveProperty('durationSeconds')
  })

  it('returns the typed response from apiRequest unchanged', async () => {
    const result = await dictateClinicalRecord(RECORD_ID, VALID_REQUEST)
    expect(result).toBe(VALID_RESPONSE)
  })

  it('propagates errors thrown by apiRequest without swallowing them', async () => {
    const apiError = new Error('Network error')
    mockApiRequest.mockRejectedValue(apiError)

    await expect(dictateClinicalRecord(RECORD_ID, VALID_REQUEST)).rejects.toThrow('Network error')
  })

  it('does not mutate the payload object passed by the caller', async () => {
    const payload: DictateClinicalRecordRequest = {
      audioBase64: 'AAA=',
      mimeType: 'audio/mp4',
      durationSeconds: 30,
    }
    const originalCopy = { ...payload }

    await dictateClinicalRecord(RECORD_ID, payload)

    expect(payload).toEqual(originalCopy)
  })
})
