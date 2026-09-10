export function parseCalendarReturnSearch(search: Record<string, unknown>): {
  googleCalendar?: 'connected' | 'error'
  message?: string
} {
  return {
    googleCalendar:
      search.googleCalendar === 'connected' || search.googleCalendar === 'error'
        ? search.googleCalendar
        : undefined,
    message: typeof search.message === 'string' ? search.message : undefined,
  }
}
