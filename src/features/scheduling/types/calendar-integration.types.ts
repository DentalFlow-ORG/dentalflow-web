export type GoogleCalendarStatus = {
  connected: boolean
  calendarSummary: string | null
  connectedAt: string | null
  lastSyncedAt: string | null
}

export type GoogleCalendarConnectResponse = {
  url: string
}

export type GoogleCalendarSyncResponse = {
  synced: number
}
