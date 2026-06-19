const AUTH_SESSION_EXPIRED_EVENT = 'dentalflow:auth-session-expired'

export function notifySessionExpired() {
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
}
