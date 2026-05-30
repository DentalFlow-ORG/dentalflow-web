import {
  cancelSubscription,
  changeSubscriptionPlan,
  createCheckoutSession,
  createPortalSession,
  getClinicSubscription,
  getCurrentBillingStatus,
  listBillingPlans,
  startTrial,
  syncCheckoutSession,
} from '@/features/billing/services/billing.service'
import { makeBillingStatus } from '@/test-utils/factories/billing.factory'

const mockApiRequest = vi.fn()
const mockGetAccessToken = vi.fn(() => 'tok-123')

vi.mock('@/services/http', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}))

vi.mock('@/features/auth/utils/session-storage', () => ({
  getAccessToken: () => mockGetAccessToken(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// ── getCurrentBillingStatus ───────────────────────────────────────────────────

describe('getCurrentBillingStatus', () => {
  it('calls GET /billing/subscription/current', async () => {
    mockApiRequest.mockResolvedValue(makeBillingStatus())
    await getCurrentBillingStatus()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/billing/subscription/current')
    expect(options.method).toBe('GET')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('session-abc')
    mockApiRequest.mockResolvedValue(makeBillingStatus())
    await getCurrentBillingStatus()

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('session-abc')
  })

  it('returns the resolved value from apiRequest unchanged', async () => {
    const status = makeBillingStatus({ planKey: 'premium', accessAllowed: true })
    mockApiRequest.mockResolvedValue(status)

    const result = await getCurrentBillingStatus()
    expect(result).toBe(status)
  })
})

// ── listBillingPlans ──────────────────────────────────────────────────────────

describe('listBillingPlans', () => {
  it('calls GET /billing/plans', async () => {
    mockApiRequest.mockResolvedValue({ plans: [], campaign: {} })
    await listBillingPlans()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/billing/plans')
    expect(options.method).toBe('GET')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-plans')
    mockApiRequest.mockResolvedValue({ plans: [], campaign: {} })
    await listBillingPlans()

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-plans')
  })
})

// ── getClinicSubscription ─────────────────────────────────────────────────────

describe('getClinicSubscription', () => {
  it('calls GET /billing/subscription', async () => {
    mockApiRequest.mockResolvedValue(null)
    await getClinicSubscription()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/billing/subscription')
    expect(options.method).toBe('GET')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-sub')
    mockApiRequest.mockResolvedValue(null)
    await getClinicSubscription()

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-sub')
  })
})

// ── changeSubscriptionPlan ────────────────────────────────────────────────────

describe('changeSubscriptionPlan', () => {
  const dto = { planKey: 'premium', billingInterval: 'YEARLY' as const }

  it('calls POST /billing/subscription/change-plan', async () => {
    mockApiRequest.mockResolvedValue(makeBillingStatus())
    await changeSubscriptionPlan(dto)

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/billing/subscription/change-plan')
    expect(options.method).toBe('POST')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-change')
    mockApiRequest.mockResolvedValue(makeBillingStatus())
    await changeSubscriptionPlan(dto)

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-change')
  })

  it('serializes { planKey, billingInterval } as the request body', async () => {
    mockApiRequest.mockResolvedValue(makeBillingStatus())
    await changeSubscriptionPlan(dto)

    const [, options] = mockApiRequest.mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({ planKey: 'premium', billingInterval: 'YEARLY' })
  })
})

// ── createCheckoutSession ─────────────────────────────────────────────────────

describe('createCheckoutSession', () => {
  const dto = { planKey: 'starter', billingInterval: 'MONTHLY' as const }

  it('calls POST /billing/checkout-session', async () => {
    mockApiRequest.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/cs_test' })
    await createCheckoutSession(dto)

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/billing/checkout-session')
    expect(options.method).toBe('POST')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-checkout')
    mockApiRequest.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/cs_test' })
    await createCheckoutSession(dto)

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-checkout')
  })

  it('serializes { planKey, billingInterval } as the request body', async () => {
    mockApiRequest.mockResolvedValue({ url: 'https://checkout.stripe.com/c/pay/cs_test' })
    await createCheckoutSession(dto)

    const [, options] = mockApiRequest.mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({ planKey: 'starter', billingInterval: 'MONTHLY' })
  })
})

// ── syncCheckoutSession ───────────────────────────────────────────────────────

describe('syncCheckoutSession', () => {
  it('calls POST /billing/checkout-session/sync', async () => {
    mockApiRequest.mockResolvedValue(makeBillingStatus())
    await syncCheckoutSession('cs_test_abc123')

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/billing/checkout-session/sync')
    expect(options.method).toBe('POST')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-sync')
    mockApiRequest.mockResolvedValue(makeBillingStatus())
    await syncCheckoutSession('cs_test_abc123')

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-sync')
  })

  it('serializes { sessionId } as the request body', async () => {
    mockApiRequest.mockResolvedValue(makeBillingStatus())
    await syncCheckoutSession('cs_test_abc123')

    const [, options] = mockApiRequest.mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({ sessionId: 'cs_test_abc123' })
  })
})

// ── startTrial ────────────────────────────────────────────────────────────────

describe('startTrial', () => {
  const dto = { planKey: 'professional', billingInterval: 'MONTHLY' as const }

  it('calls POST /billing/trial/start', async () => {
    mockApiRequest.mockResolvedValue(makeBillingStatus({ status: 'trialing' }))
    await startTrial(dto)

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/billing/trial/start')
    expect(options.method).toBe('POST')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-trial')
    mockApiRequest.mockResolvedValue(makeBillingStatus({ status: 'trialing' }))
    await startTrial(dto)

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-trial')
  })

  it('serializes { planKey, billingInterval } as the request body', async () => {
    mockApiRequest.mockResolvedValue(makeBillingStatus({ status: 'trialing' }))
    await startTrial(dto)

    const [, options] = mockApiRequest.mock.calls[0]
    expect(JSON.parse(options.body)).toEqual({ planKey: 'professional', billingInterval: 'MONTHLY' })
  })
})

// ── createPortalSession ───────────────────────────────────────────────────────

describe('createPortalSession', () => {
  it('calls POST /billing/portal-session', async () => {
    mockApiRequest.mockResolvedValue({ url: 'https://billing.stripe.com/p/session_test' })
    await createPortalSession()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/billing/portal-session')
    expect(options.method).toBe('POST')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-portal')
    mockApiRequest.mockResolvedValue({ url: 'https://billing.stripe.com/p/session_test' })
    await createPortalSession()

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-portal')
  })
})

// ── cancelSubscription ────────────────────────────────────────────────────────

describe('cancelSubscription', () => {
  it('calls POST /billing/subscription/cancel', async () => {
    mockApiRequest.mockResolvedValue(undefined)
    await cancelSubscription()

    const [path, options] = mockApiRequest.mock.calls[0]
    expect(path).toBe('/billing/subscription/cancel')
    expect(options.method).toBe('POST')
  })

  it('passes the accessToken from getAccessToken()', async () => {
    mockGetAccessToken.mockReturnValue('tok-cancel')
    mockApiRequest.mockResolvedValue(undefined)
    await cancelSubscription()

    const [, options] = mockApiRequest.mock.calls[0]
    expect(options.accessToken).toBe('tok-cancel')
  })
})

// ── error propagation ─────────────────────────────────────────────────────────

describe('error propagation', () => {
  it('rejects with the same error that apiRequest throws', async () => {
    const error = new Error('Network error')
    mockApiRequest.mockRejectedValue(error)

    await expect(getCurrentBillingStatus()).rejects.toThrow('Network error')
  })
})
