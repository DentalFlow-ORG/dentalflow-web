import { getAccessToken } from '@/features/auth/utils/session-storage'
import { apiRequest } from '@/services/http'

import type {
  GoogleCalendarConnectResponse,
  GoogleCalendarStatus,
  GoogleCalendarSyncResponse,
} from '../types/calendar-integration.types'

export function getGoogleCalendarStatus() {
  return apiRequest<GoogleCalendarStatus>('/calendar-integrations/google/status', {
    method: 'GET',
    accessToken: getAccessToken(),
  })
}

export function createGoogleCalendarConnectUrl() {
  return apiRequest<GoogleCalendarConnectResponse>(
    '/calendar-integrations/google/connect',
    {
      method: 'POST',
      accessToken: getAccessToken(),
    },
  )
}

export function disconnectGoogleCalendar() {
  return apiRequest<GoogleCalendarStatus>('/calendar-integrations/google/disconnect', {
    method: 'POST',
    accessToken: getAccessToken(),
    timeoutMs: 60_000,
  })
}

export function syncGoogleCalendar() {
  return apiRequest<GoogleCalendarSyncResponse>('/calendar-integrations/google/sync', {
    method: 'POST',
    accessToken: getAccessToken(),
    timeoutMs: 60_000,
  })
}
