import { act, renderHook, waitFor } from '@testing-library/react'

import { getCachedBillingStatus } from '@/features/billing/services/billing-status-cache'
import { getCurrentBillingStatus } from '@/features/billing/services/billing.service'
import type { CurrentBillingStatus } from '@/features/billing/types/billing.types'
import { useClinicalDictationAccess } from '@/features/clinical-records/hooks/useClinicalDictationAccess'

vi.mock('@/features/billing/services/billing-status-cache')
vi.mock('@/features/billing/services/billing.service')

beforeEach(() => vi.resetAllMocks())

it('does not allow an inactive Premium subscription', () => {
  vi.mocked(getCachedBillingStatus).mockReturnValue({
    planKey: 'premium',
    accessAllowed: false,
  } as CurrentBillingStatus)
  const { result } = renderHook(useClinicalDictationAccess)
  expect(result.current.allowed).toBe(false)
  expect(getCurrentBillingStatus).not.toHaveBeenCalled()
})

it.each(['resolve', 'reject'])('ignores a late %s after unmount', async (outcome) => {
  vi.mocked(getCachedBillingStatus).mockReturnValue(null)
  let finish: () => void = () => undefined
  vi.mocked(getCurrentBillingStatus).mockReturnValue(
    new Promise((resolve, reject) => {
      finish = () => {
        if (outcome === 'resolve')
          resolve({ planKey: 'premium', accessAllowed: true } as CurrentBillingStatus)
        else reject(new Error('offline'))
      }
    }),
  )
  const { result, unmount } = renderHook(useClinicalDictationAccess)
  await waitFor(() => expect(getCurrentBillingStatus).toHaveBeenCalledTimes(1))
  unmount()
  await act(async () => finish())
  expect(result.current.isLoading).toBe(true)
  expect(result.current.error).toBe(false)
})
