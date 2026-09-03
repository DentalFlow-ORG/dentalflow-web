import { notifySessionExpired } from '@/features/auth/utils/auth-events'

describe('notifySessionExpired', () => {
  it('dispatches a dentalflow:auth-session-expired event on window', () => {
    const handler = vi.fn()
    window.addEventListener('dentalflow:auth-session-expired', handler)

    notifySessionExpired()

    expect(handler).toHaveBeenCalledOnce()
    window.removeEventListener('dentalflow:auth-session-expired', handler)
  })
})
