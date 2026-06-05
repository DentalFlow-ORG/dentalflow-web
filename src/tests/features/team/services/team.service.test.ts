import { toggleProfilePublishStatus } from '@/features/team/services/team.service'

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'token-test')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

describe('team.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApiRequest.mockResolvedValue({
      id: 'profile-1',
      slug: 'dra-ana',
      isPublished: true,
    })
  })

  it('toggles profile publish status with PATCH /profiles/:id/publish and no body', async () => {
    await toggleProfilePublishStatus('profile-1')

    expect(mockApiRequest).toHaveBeenCalledWith('/profiles/profile-1/publish', {
      method: 'PATCH',
      accessToken: 'token-test',
    })
  })

  it('returns the typed publish result from the API response', async () => {
    const result = await toggleProfilePublishStatus('profile-1')

    expect(result).toEqual({
      id: 'profile-1',
      slug: 'dra-ana',
      isPublished: true,
    })
  })
})
