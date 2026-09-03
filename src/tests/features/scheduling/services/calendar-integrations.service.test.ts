import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createGoogleCalendarConnectUrl,
  disconnectGoogleCalendar,
  getGoogleCalendarStatus,
  syncGoogleCalendar,
} from '@/features/scheduling/services/calendar-integrations.service'

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'tok-test')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

beforeEach(() => {
  mockApiRequest.mockReset().mockResolvedValue({})
  mockGetAccessToken.mockReturnValue('tok-test')
})

describe('getGoogleCalendarStatus', () => {
  it('GETs the status endpoint with the access token', async () => {
    await getGoogleCalendarStatus()
    expect(mockApiRequest).toHaveBeenCalledWith('/calendar-integrations/google/status', {
      method: 'GET',
      accessToken: 'tok-test',
    })
  })
})

describe('createGoogleCalendarConnectUrl', () => {
  it('POSTs to the connect endpoint', async () => {
    await createGoogleCalendarConnectUrl()
    expect(mockApiRequest).toHaveBeenCalledWith('/calendar-integrations/google/connect', {
      method: 'POST',
      accessToken: 'tok-test',
    })
  })
})

describe('disconnectGoogleCalendar', () => {
  it('POSTs to the disconnect endpoint with an extended timeout', async () => {
    await disconnectGoogleCalendar()
    expect(mockApiRequest).toHaveBeenCalledWith('/calendar-integrations/google/disconnect', {
      method: 'POST',
      accessToken: 'tok-test',
      timeoutMs: 60_000,
    })
  })
})

describe('syncGoogleCalendar', () => {
  it('POSTs to the sync endpoint with an extended timeout', async () => {
    await syncGoogleCalendar()
    expect(mockApiRequest).toHaveBeenCalledWith('/calendar-integrations/google/sync', {
      method: 'POST',
      accessToken: 'tok-test',
      timeoutMs: 60_000,
    })
  })
})
