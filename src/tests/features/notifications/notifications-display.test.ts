import {
  TEMPLATES_BY_STATUS,
  TEMPLATE_LABELS,
} from '@/features/notifications/services/notifications.service'

// AppointmentNotificationActions only ever renders slugs drawn from
// TEMPLATES_BY_STATUS, and falls back to the raw slug if one has no label.
// That fallback is unreachable exactly as long as the two maps agree.

describe('notification template display maps', () => {
  it('labels every slug that can be offered for an appointment status', () => {
    for (const slugs of Object.values(TEMPLATES_BY_STATUS)) {
      for (const slug of slugs) {
        expect(TEMPLATE_LABELS[slug]).toBeTruthy()
      }
    }
  })

  it('offers every labelled template for at least one status', () => {
    const offered = new Set(Object.values(TEMPLATES_BY_STATUS).flat())
    for (const slug of Object.keys(TEMPLATE_LABELS)) {
      expect(offered.has(slug)).toBe(true)
    }
  })
})
