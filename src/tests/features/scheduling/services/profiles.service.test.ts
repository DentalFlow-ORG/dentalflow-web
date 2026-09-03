import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getProfile, listProfiles } from '@/features/scheduling/services/profiles.service'

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

describe('listProfiles', () => {
  it('GETs the profiles list with the access token', async () => {
    await listProfiles()
    expect(mockApiRequest).toHaveBeenCalledWith('/profiles', {
      method: 'GET',
      accessToken: 'tok-test',
    })
  })
})

describe('getProfile', () => {
  it('GETs a single profile by id', async () => {
    await getProfile('profile-1')
    expect(mockApiRequest).toHaveBeenCalledWith('/profiles/profile-1', {
      method: 'GET',
      accessToken: 'tok-test',
    })
  })
})
