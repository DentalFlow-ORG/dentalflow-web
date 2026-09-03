import {
  getBillingAccess,
  setBillingAccess,
  subscribeBillingAccess,
} from '@/features/theme/billing-theme-override'

describe('billing-theme-override', () => {
  afterEach(() => {
    setBillingAccess(null)
  })

  it('starts as null', () => {
    expect(getBillingAccess()).toBeNull()
  })

  it('updates the value and notifies subscribers when it changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeBillingAccess(listener)

    setBillingAccess(true)

    expect(getBillingAccess()).toBe(true)
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
  })

  it('does not notify subscribers when set to the same value', () => {
    setBillingAccess(true)
    const listener = vi.fn()
    const unsubscribe = subscribeBillingAccess(listener)

    setBillingAccess(true)

    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('unsubscribe stops further notifications', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeBillingAccess(listener)
    unsubscribe()

    setBillingAccess(false)

    expect(listener).not.toHaveBeenCalled()
  })
})
