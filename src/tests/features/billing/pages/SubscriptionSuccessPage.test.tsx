import { SubscriptionSuccessPage } from '@/features/billing/pages/SubscriptionSuccessPage'
import { makeBillingStatus } from '@/test-utils/factories/billing.factory'
import { resetRouterMocks, setMockSearch } from '@/test-utils/mocks/router'
import { act, fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockSyncCheckoutSession = vi.fn()
const mockGetCurrentBillingStatus = vi.fn()
const mockCreatePortalSession = vi.fn()
const mockClearBillingStatusCache = vi.fn()
const mockSetCachedBillingStatus = vi.fn()

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/billing/services/billing.service', () => ({
  syncCheckoutSession: (...args: unknown[]) => mockSyncCheckoutSession(...args),
  getCurrentBillingStatus: () => mockGetCurrentBillingStatus(),
  createPortalSession: () => mockCreatePortalSession(),
}))

vi.mock('@/features/billing/services/billing-status-cache', () => ({
  clearBillingStatusCache: () => mockClearBillingStatusCache(),
  setCachedBillingStatus: (...args: unknown[]) => mockSetCachedBillingStatus(...args),
}))

// BrandLink → BrandLogo → useTheme() requires ThemeProvider which is not in
// TestProviders. Mock as no-op to keep the test focused on page behavior.
vi.mock('@/components/brand/BrandLink', () => ({
  BrandLink: () => null,
}))

// ── Lifecycle ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  resetRouterMocks()
  setMockSearch({ session_id: 'cs_test_123' })
  // Pending by default — keeps the component in the loading/processing state
  mockSyncCheckoutSession.mockReturnValue(new Promise(() => {}))
  mockGetCurrentBillingStatus.mockReturnValue(new Promise(() => {}))
  mockCreatePortalSession.mockReturnValue(new Promise(() => {}))
})

// ── Loading state ─────────────────────────────────────────────────────────────

describe('loading state', () => {
  it('shows "Confirmando assinatura" heading and processing icon while sync is pending', () => {
    render(<SubscriptionSuccessPage />)
    expect(screen.getByRole('heading', { name: 'Confirmando assinatura' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Processando confirmação' })).toBeInTheDocument()
  })
})

// ── Confirmed state ───────────────────────────────────────────────────────────

describe('confirmed state', () => {
  beforeEach(() => {
    mockSyncCheckoutSession.mockResolvedValue(
      makeBillingStatus({
        accessAllowed: true,
        planName: 'Professional',
        billingInterval: 'monthly',
      }),
    )
  })

  it('shows "Assinatura confirmada" heading after sync resolves with accessAllowed: true', async () => {
    render(<SubscriptionSuccessPage />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Assinatura confirmada' })).toBeInTheDocument(),
    )
    expect(screen.getByRole('img', { name: 'Assinatura confirmada' })).toBeInTheDocument()
  })

  it('shows subscription summary with plan name when confirmed', async () => {
    render(<SubscriptionSuccessPage />)
    await waitFor(() => expect(screen.getByText('Professional')).toBeInTheDocument())
  })

  it('does not render "Verificar novamente" button when confirmed', async () => {
    render(<SubscriptionSuccessPage />)
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: /Verificar novamente/i }),
      ).not.toBeInTheDocument(),
    )
  })
})

// ── Sync error ────────────────────────────────────────────────────────────────

describe('sync error', () => {
  it('shows a warning when syncCheckoutSession rejects', async () => {
    mockSyncCheckoutSession.mockRejectedValue(new Error('Network error'))
    render(<SubscriptionSuccessPage />)
    await waitFor(() =>
      expect(screen.getByText(/Não foi possível confirmar a assinatura agora/)).toBeInTheDocument(),
    )
  })
})

// ── Retry behavior ────────────────────────────────────────────────────────────
// vi.useFakeTimers is scoped here so it does not break waitFor in other groups.
// vi.advanceTimersByTimeAsync advances the clock AND awaits pending microtasks
// between each tick, allowing the async runCheck chain to settle.

describe('retry behavior', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('calls getCurrentBillingStatus after RETRY_INTERVAL_MS when initial sync returns accessAllowed: false', async () => {
    mockSyncCheckoutSession.mockResolvedValue(makeBillingStatus({ accessAllowed: false }))
    mockGetCurrentBillingStatus.mockResolvedValue(makeBillingStatus({ accessAllowed: false }))

    render(<SubscriptionSuccessPage />)

    // Flush: effect → runCheck(1) → syncCheckoutSession resolves → state update
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(mockSyncCheckoutSession).toHaveBeenCalledOnce()

    // Advance retry timer; advanceTimersByTimeAsync also awaits the async chain
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500)
    })
    expect(mockGetCurrentBillingStatus).toHaveBeenCalledOnce()
  })

  it('shows "Pagamento recebido" heading after MAX_ATTEMPTS are exhausted without confirmation', async () => {
    mockSyncCheckoutSession.mockResolvedValue(makeBillingStatus({ accessAllowed: false }))
    mockGetCurrentBillingStatus.mockResolvedValue(makeBillingStatus({ accessAllowed: false }))

    render(<SubscriptionSuccessPage />)

    // Attempt 1 — syncCheckoutSession (reconcileCheckout: true)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(mockSyncCheckoutSession).toHaveBeenCalledOnce()

    // Attempts 2–6 — getCurrentBillingStatus via setTimeout retries (5 advances)
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500)
      })
    }

    expect(screen.getByRole('heading', { name: 'Pagamento recebido' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Atenção: sincronização pendente' })).toBeInTheDocument()
  })
})

// ── Manual refresh ────────────────────────────────────────────────────────────

describe('manual refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('clicking "Verificar novamente" calls syncCheckoutSession again with the session id', async () => {
    mockSyncCheckoutSession.mockResolvedValue(makeBillingStatus({ accessAllowed: false }))
    mockGetCurrentBillingStatus.mockResolvedValue(makeBillingStatus({ accessAllowed: false }))

    render(<SubscriptionSuccessPage />)

    // Exhaust all retries to reach attention state
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2500)
      })
    }

    // Reset counts to isolate the manual refresh call
    vi.clearAllMocks()
    mockSyncCheckoutSession.mockReturnValue(new Promise(() => {}))

    fireEvent.click(screen.getByRole('button', { name: /Verificar novamente/i }))

    // handleManualRefresh → refreshStatus({ reconcileCheckout: true }) → syncCheckoutSession
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(mockSyncCheckoutSession).toHaveBeenCalledWith('cs_test_123')
  })
})

// ── Portal navigation ─────────────────────────────────────────────────────────

describe('portal navigation', () => {
  let assignSpy: ReturnType<typeof vi.fn>
  let savedLocation: Location

  beforeEach(() => {
    savedLocation = window.location
    assignSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { assign: assignSpy, pathname: '/app/assinatura/sucesso' },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: savedLocation,
      configurable: true,
      writable: true,
    })
  })

  it('calls createPortalSession and assigns window.location to the portal URL', async () => {
    mockCreatePortalSession.mockResolvedValue({ url: 'https://billing.stripe.com/portal/test' })

    render(<SubscriptionSuccessPage />)

    fireEvent.click(screen.getByRole('button', { name: /Gerenciar assinatura/i }))

    // createPortalSession resolves via microtask → window.location.assign called
    await act(async () => {})
    expect(assignSpy).toHaveBeenCalledWith('https://billing.stripe.com/portal/test')
    expect(mockCreatePortalSession).toHaveBeenCalledOnce()
  })

  it('disables "Gerenciar assinatura" button while portal session is opening', async () => {
    render(<SubscriptionSuccessPage />)

    fireEvent.click(screen.getByRole('button', { name: /Gerenciar assinatura/i }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Gerenciar assinatura/i })).toBeDisabled(),
    )
  })
})

// ── Portal error ──────────────────────────────────────────────────────────────

describe('portal error', () => {
  it('shows a warning when createPortalSession rejects', async () => {
    mockCreatePortalSession.mockRejectedValue(new Error('Portal unavailable'))

    render(<SubscriptionSuccessPage />)

    fireEvent.click(screen.getByRole('button', { name: /Gerenciar assinatura/i }))

    await waitFor(() =>
      expect(
        screen.getByText(/Não foi possível abrir o portal de assinatura agora/),
      ).toBeInTheDocument(),
    )
  })
})

// ── Missing session_id ────────────────────────────────────────────────────────

describe('missing session_id', () => {
  it('calls getCurrentBillingStatus instead of syncCheckoutSession when session_id is absent', async () => {
    setMockSearch({})
    mockGetCurrentBillingStatus.mockResolvedValue(makeBillingStatus({ accessAllowed: false }))

    render(<SubscriptionSuccessPage />)

    await waitFor(() => expect(mockGetCurrentBillingStatus).toHaveBeenCalledOnce())
    expect(mockSyncCheckoutSession).not.toHaveBeenCalled()
  })
})
