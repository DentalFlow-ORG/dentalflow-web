import {
  CATEGORY_COLORS,
  CATEGORY_COLOR_NAMES,
  SOURCE_LABEL,
} from '@/features/finance/constants/finance-display'

// These maps are declared as Record<string, string> so callers can look up a
// value the backend may widen later, and each call site carries a `?? raw`
// fallback. Those fallbacks are unreachable only as long as the maps stay
// complete — these tests are what keeps that claim true.

describe('finance display maps', () => {
  it('names every selectable category colour', () => {
    for (const color of CATEGORY_COLORS) {
      expect(CATEGORY_COLOR_NAMES[color]).toBeTruthy()
    }
  })

  it('has no colour name that is not offered in the picker', () => {
    for (const color of Object.keys(CATEGORY_COLOR_NAMES)) {
      expect(CATEGORY_COLORS).toContain(color)
    }
  })

  it('labels every financial transaction source', () => {
    for (const source of ['MANUAL', 'SERVICE_PAYMENT', 'FIXED_EXPENSE', 'ADJUSTMENT']) {
      expect(SOURCE_LABEL[source]).toBeTruthy()
    }
  })
})
