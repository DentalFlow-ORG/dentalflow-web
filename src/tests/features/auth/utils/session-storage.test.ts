import {
  clearSession,
  getAccessToken,
  hasStoredSession,
  setSession,
  setTokens,
  updateStoredUser,
} from '@/features/auth/utils/session-storage'

describe('session-storage', () => {
  beforeEach(() => {
    localStorage.clear()
    clearSession()
  })

  it('hasStoredSession is false by default', () => {
    expect(hasStoredSession()).toBe(false)
  })

  it('getAccessToken is null by default', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('setSession marks the session active and stores the token in memory', () => {
    setSession('token-123')
    expect(hasStoredSession()).toBe(true)
    expect(getAccessToken()).toBe('token-123')
  })

  it('setTokens updates the in-memory token and clears the legacy key', () => {
    localStorage.setItem('dentalflow.accessToken', 'legacy-token')
    setTokens('new-token')
    expect(getAccessToken()).toBe('new-token')
    expect(localStorage.getItem('dentalflow.accessToken')).toBeNull()
  })

  it('updateStoredUser removes the legacy user key', () => {
    localStorage.setItem('dentalflow.user', '{"id":"1"}')
    updateStoredUser()
    expect(localStorage.getItem('dentalflow.user')).toBeNull()
  })

  it('clearSession clears the in-memory token, active-session flag, and legacy keys', () => {
    setSession('token-123')
    localStorage.setItem('dentalflow.accessToken', 'legacy-token')
    localStorage.setItem('dentalflow.user', '{"id":"1"}')

    clearSession()

    expect(getAccessToken()).toBeNull()
    expect(hasStoredSession()).toBe(false)
    expect(localStorage.getItem('dentalflow.accessToken')).toBeNull()
    expect(localStorage.getItem('dentalflow.user')).toBeNull()
  })
})
