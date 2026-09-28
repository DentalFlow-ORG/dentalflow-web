import { act, waitFor } from '@testing-library/react'

import { renderHook } from '@/test-utils/render-utils'

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

const mockSetCachedBillingStatus = vi.fn()
vi.mock('@/features/billing/services/billing-status-cache', () => ({
  setCachedBillingStatus: (...args: unknown[]) => mockSetCachedBillingStatus(...args),
}))

const mockListBillingPlans = vi.fn()
const mockGetCurrentBillingStatus = vi.fn()
const mockCreateCheckoutSession = vi.fn()
const mockCreatePortalSession = vi.fn()
const mockStartTrial = vi.fn()
const mockChangeSubscriptionPlan = vi.fn()
const mockCancelSubscription = vi.fn()

vi.mock('@/features/billing/services/billing.service', () => ({
  listBillingPlans: (...args: unknown[]) => mockListBillingPlans(...args),
  getCurrentBillingStatus: (...args: unknown[]) => mockGetCurrentBillingStatus(...args),
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckoutSession(...args),
  createPortalSession: (...args: unknown[]) => mockCreatePortalSession(...args),
  startTrial: (...args: unknown[]) => mockStartTrial(...args),
  changeSubscriptionPlan: (...args: unknown[]) => mockChangeSubscriptionPlan(...args),
  cancelSubscription: (...args: unknown[]) => mockCancelSubscription(...args),
}))

import { useSubscriptionPage } from '@/features/billing/hooks/useSubscriptionPage'
import { makeBillingPlan, makeBillingStatus } from '@/test-utils/factories/billing.factory'

const originalLocation = window.location

beforeEach(() => {
  vi.clearAllMocks()
  mockListBillingPlans.mockResolvedValue({ plans: [], campaign: null })
  mockGetCurrentBillingStatus.mockResolvedValue(makeBillingStatus())
  Object.defineProperty(window, 'location', {
    value: { ...originalLocation, href: '' },
    configurable: true,
    writable: true,
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    configurable: true,
    writable: true,
  })
})

async function renderLoaded() {
  const result = renderHook(() => useSubscriptionPage())
  await waitFor(() => expect(result.result.current.isLoadingPlans).toBe(false))
  await waitFor(() => expect(result.result.current.isLoadingBillingStatus).toBe(false))
  return result
}

describe('useSubscriptionPage — initial load', () => {
  it('loads plans and billing status on mount', async () => {
    const plans = [makeBillingPlan()]
    mockListBillingPlans.mockResolvedValue({ plans, campaign: null })
    const { result } = await renderLoaded()
    expect(result.current.plans).toEqual(plans)
    expect(result.current.billingStatus).not.toBeNull()
  })

  it('caches the billing status once loaded', async () => {
    await renderLoaded()
    expect(mockSetCachedBillingStatus).toHaveBeenCalled()
  })

  it('sets plansError with the Error message on failure', async () => {
    mockListBillingPlans.mockRejectedValue(new Error('Falha ao buscar planos'))
    const { result } = await renderLoaded()
    expect(result.current.plansError).toBe('Falha ao buscar planos')
  })

  it('sets a generic plansError when the rejection is not an Error', async () => {
    mockListBillingPlans.mockRejectedValue('boom')
    const { result } = await renderLoaded()
    expect(result.current.plansError).toBe('Não foi possível carregar os planos.')
  })

  it('sets billingStatusError with the Error message on failure', async () => {
    mockGetCurrentBillingStatus.mockRejectedValue(new Error('Falha ao buscar assinatura'))
    const { result } = await renderLoaded()
    expect(result.current.billingStatusError).toBe('Falha ao buscar assinatura')
  })

  it('sets a generic billingStatusError when the rejection is not an Error', async () => {
    mockGetCurrentBillingStatus.mockRejectedValue('boom')
    const { result } = await renderLoaded()
    expect(result.current.billingStatusError).toBe(
      'Não foi possível carregar sua assinatura. Tente novamente.',
    )
  })
})

describe('useSubscriptionPage — interval auto-correction', () => {
  it('switches from MONTHLY to YEARLY when no plan offers monthly but some offer yearly', async () => {
    mockListBillingPlans.mockResolvedValue({
      plans: [makeBillingPlan({ hasMonthlyPrice: false, hasYearlyPrice: true })],
      campaign: null,
    })
    const { result } = await renderLoaded()
    act(() => result.current.setBillingInterval('MONTHLY'))
    await waitFor(() => expect(result.current.billingInterval).toBe('YEARLY'))
  })

  it('switches from YEARLY to MONTHLY when no plan offers yearly but some offer monthly', async () => {
    mockListBillingPlans.mockResolvedValue({
      plans: [makeBillingPlan({ hasMonthlyPrice: true, hasYearlyPrice: false })],
      campaign: null,
    })
    const { result } = await renderLoaded()
    expect(result.current.billingInterval).toBe('MONTHLY')
  })

  it('leaves the interval alone when plans list is empty', async () => {
    const { result } = await renderLoaded()
    expect(result.current.billingInterval).toBe('YEARLY')
  })
})

describe('useSubscriptionPage — derived flags', () => {
  it('showIntervalToggle is true when any plan has monthly or yearly pricing', async () => {
    mockListBillingPlans.mockResolvedValue({
      plans: [makeBillingPlan({ hasMonthlyPrice: true, hasYearlyPrice: false })],
      campaign: null,
    })
    const { result } = await renderLoaded()
    expect(result.current.showIntervalToggle).toBe(true)
  })

  it('showIntervalToggle is false when there are no plans', async () => {
    const { result } = await renderLoaded()
    expect(result.current.showIntervalToggle).toBe(false)
  })

  it('canCancel is true when access is allowed, has a stripe subscription, and not already canceling', async () => {
    mockGetCurrentBillingStatus.mockResolvedValue(
      makeBillingStatus({
        accessAllowed: true,
        stripeSubscriptionId: 'sub_1',
        cancelAtPeriodEnd: false,
      }),
    )
    const { result } = await renderLoaded()
    expect(result.current.canCancel).toBe(true)
  })

  it('canCancel is false when cancelAtPeriodEnd is already true', async () => {
    mockGetCurrentBillingStatus.mockResolvedValue(
      makeBillingStatus({
        accessAllowed: true,
        stripeSubscriptionId: 'sub_1',
        cancelAtPeriodEnd: true,
      }),
    )
    const { result } = await renderLoaded()
    expect(result.current.canCancel).toBe(false)
  })

  it('canCancel is false when there is no stripeSubscriptionId', async () => {
    mockGetCurrentBillingStatus.mockResolvedValue(
      makeBillingStatus({ accessAllowed: true, stripeSubscriptionId: null }),
    )
    const { result } = await renderLoaded()
    expect(result.current.canCancel).toBe(false)
  })

  it('canCancel is false when billingStatus is still null', () => {
    mockGetCurrentBillingStatus.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useSubscriptionPage())
    expect(result.current.canCancel).toBe(false)
  })
})

describe('useSubscriptionPage — handleStartTrial', () => {
  it('starts the trial, shows a success alert, and redirects to /app', async () => {
    mockStartTrial.mockResolvedValue(makeBillingStatus())
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleStartTrial('starter')
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Teste grátis iniciado', tone: 'success' }),
    )
    expect(window.location.href).toBe('/app')
  })

  it('shows an error alert and resets startingTrialPlanKey on failure', async () => {
    mockStartTrial.mockRejectedValue(new Error('Trial indisponível'))
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleStartTrial('starter')
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao iniciar teste',
        description: 'Trial indisponível',
      }),
    )
    expect(result.current.startingTrialPlanKey).toBeNull()
  })

  it('shows a generic error message when the rejection is not an Error', async () => {
    mockStartTrial.mockRejectedValue('boom')
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleStartTrial('starter')
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Não foi possível iniciar o teste grátis.' }),
    )
  })
})

describe('useSubscriptionPage — handleCheckout', () => {
  it('redirects to the checkout URL on success', async () => {
    mockCreateCheckoutSession.mockResolvedValue({ url: 'https://stripe.test/checkout' })
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleCheckout('professional')
    })
    expect(window.location.href).toBe('https://stripe.test/checkout')
  })

  it('shows an error alert and resets checkingOutPlanKey on failure', async () => {
    mockCreateCheckoutSession.mockRejectedValue(new Error('Checkout indisponível'))
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleCheckout('professional')
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro no checkout', description: 'Checkout indisponível' }),
    )
    expect(result.current.checkingOutPlanKey).toBeNull()
  })

  it('shows a generic error message when the rejection is not an Error', async () => {
    mockCreateCheckoutSession.mockRejectedValue('boom')
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleCheckout('professional')
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Não foi possível iniciar o checkout.' }),
    )
  })
})

describe('useSubscriptionPage — handleChangePlan', () => {
  it('updates billingStatus and shows a success alert', async () => {
    const nextStatus = makeBillingStatus({ planKey: 'premium' })
    mockChangeSubscriptionPlan.mockResolvedValue(nextStatus)
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleChangePlan('premium')
    })
    expect(result.current.billingStatus).toEqual(nextStatus)
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Plano atualizado', tone: 'success' }),
    )
    expect(result.current.changingPlanKey).toBeNull()
  })

  it('shows an error alert with the Error message on failure', async () => {
    mockChangeSubscriptionPlan.mockRejectedValue(new Error('Não foi possível trocar'))
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleChangePlan('premium')
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao alterar plano',
        description: 'Não foi possível trocar',
      }),
    )
  })

  it('shows a generic error message when the rejection is not an Error', async () => {
    mockChangeSubscriptionPlan.mockRejectedValue('boom')
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleChangePlan('premium')
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Não foi possível alterar o plano.' }),
    )
  })
})

describe('useSubscriptionPage — plan change confirmation', () => {
  it('only records the selected plan until the change is confirmed', async () => {
    const { result } = await renderLoaded()
    act(() => result.current.requestPlanChange('premium'))
    expect(result.current.pendingPlanChangeKey).toBe('premium')
    expect(mockChangeSubscriptionPlan).not.toHaveBeenCalled()
  })

  it('discards the selected plan when the owner keeps the current one', async () => {
    const { result } = await renderLoaded()
    act(() => result.current.requestPlanChange('premium'))
    act(() => result.current.cancelPlanChange())
    expect(result.current.pendingPlanChangeKey).toBeNull()
    expect(mockChangeSubscriptionPlan).not.toHaveBeenCalled()
  })

  it('changes to the selected plan on confirmation and clears the pending selection', async () => {
    mockChangeSubscriptionPlan.mockResolvedValue(makeBillingStatus({ planKey: 'premium' }))
    const { result } = await renderLoaded()
    act(() => result.current.requestPlanChange('premium'))
    await act(async () => {
      await result.current.confirmPlanChange()
    })
    expect(mockChangeSubscriptionPlan).toHaveBeenCalledWith({
      planKey: 'premium',
      billingInterval: result.current.billingInterval,
    })
    expect(result.current.pendingPlanChangeKey).toBeNull()
  })

  it('clears the pending selection when the confirmed change fails', async () => {
    mockChangeSubscriptionPlan.mockRejectedValue(new Error('Cartão recusado'))
    const { result } = await renderLoaded()
    act(() => result.current.requestPlanChange('premium'))
    await act(async () => {
      await result.current.confirmPlanChange()
    })
    expect(result.current.pendingPlanChangeKey).toBeNull()
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao alterar plano', description: 'Cartão recusado' }),
    )
  })

  it('does nothing when confirming without a selected plan', async () => {
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.confirmPlanChange()
    })
    expect(mockChangeSubscriptionPlan).not.toHaveBeenCalled()
  })
})

describe('useSubscriptionPage — handlePortal', () => {
  it('redirects to the portal URL on success', async () => {
    mockCreatePortalSession.mockResolvedValue({ url: 'https://stripe.test/portal' })
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handlePortal()
    })
    expect(window.location.href).toBe('https://stripe.test/portal')
  })

  it('shows an error alert and resets isOpeningPortal on failure', async () => {
    mockCreatePortalSession.mockRejectedValue(new Error('Portal indisponível'))
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handlePortal()
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao abrir portal',
        description: 'Portal indisponível',
      }),
    )
    expect(result.current.isOpeningPortal).toBe(false)
  })

  it('shows a generic error message when the rejection is not an Error', async () => {
    mockCreatePortalSession.mockRejectedValue('boom')
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handlePortal()
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Não foi possível abrir o portal de assinatura.' }),
    )
  })
})

describe('useSubscriptionPage — handleCancelConfirm', () => {
  it('cancels the subscription, closes the dialog, shows a success alert, and reloads billing status', async () => {
    mockCancelSubscription.mockResolvedValue(undefined)
    const { result } = await renderLoaded()
    act(() => result.current.setShowCancelDialog(true))
    await act(async () => {
      await result.current.handleCancelConfirm()
    })
    expect(result.current.showCancelDialog).toBe(false)
    expect(mockShowAlert).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }))
    expect(mockGetCurrentBillingStatus).toHaveBeenCalledTimes(2)
    expect(result.current.isCanceling).toBe(false)
  })

  it('shows an error alert with the Error message on failure and keeps the dialog open', async () => {
    mockCancelSubscription.mockRejectedValue(new Error('Falha ao cancelar'))
    const { result } = await renderLoaded()
    act(() => result.current.setShowCancelDialog(true))
    await act(async () => {
      await result.current.handleCancelConfirm()
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Erro ao cancelar assinatura',
        description: 'Falha ao cancelar',
      }),
    )
    expect(result.current.showCancelDialog).toBe(true)
    expect(result.current.isCanceling).toBe(false)
  })

  it('shows a generic error message when the rejection is not an Error', async () => {
    mockCancelSubscription.mockRejectedValue('boom')
    const { result } = await renderLoaded()
    await act(async () => {
      await result.current.handleCancelConfirm()
    })
    expect(mockShowAlert).toHaveBeenCalledWith(
      expect.objectContaining({
        description:
          'Não foi possível cancelar a assinatura. Tente novamente ou entre em contato com o suporte.',
      }),
    )
  })
})

describe('useSubscriptionPage — isAnyActionPending', () => {
  it('is true while a checkout, trial, plan change, or portal action is in flight', async () => {
    mockCreateCheckoutSession.mockReturnValue(new Promise(() => {}))
    const { result } = await renderLoaded()
    act(() => {
      result.current.handleCheckout('starter')
    })
    await waitFor(() => expect(result.current.isAnyActionPending).toBe(true))
  })

  it('is false when nothing is pending', async () => {
    const { result } = await renderLoaded()
    expect(result.current.isAnyActionPending).toBe(false)
  })
})
