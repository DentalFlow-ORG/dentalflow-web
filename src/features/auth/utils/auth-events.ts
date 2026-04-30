const AUTH_SESSION_EXPIRED_EVENT = 'dentalflow:auth-session-expired'

export function notifySessionExpired() {
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
}

export function onSessionExpired(callback: () => void) {
  window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, callback)

  return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, callback)
}
