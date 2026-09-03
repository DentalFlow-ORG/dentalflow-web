import { render, screen } from '@/test-utils/render-utils'

import { InventoryAnalysisPanel } from '@/features/inventory/components/InventoryAnalysisPanel'
import type { StockSummary } from '@/features/inventory/types/inventory.types'
import { makeDentistUser, makeOwnerUser } from '@/test-utils/factories/user.factory'

let mockUser: ReturnType<typeof makeOwnerUser> | null = makeOwnerUser()
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
}))

const mockUseAiAssistantInventory = vi.fn()
vi.mock('@/features/inventory/hooks/useAiAssistantInventory', () => ({
  useAiAssistantInventory: () => mockUseAiAssistantInventory(),
}))

function makeSummary(overrides: Partial<StockSummary> = {}): StockSummary {
  return {
    total: 0,
    active: 0,
    emptyStock: 0,
    lowStock: 0,
    expiring: 0,
    expired: 0,
    inactive: 0,
    ...overrides,
  } as StockSummary
}

function defaultHookState(overrides = {}) {
  return {
    savedAnalysis: null,
    quota: null,
    dataReadiness: null,
    visibility: undefined,
    isLoadingInitial: false,
    handleGenerate: vi.fn(),
    ...overrides,
  }
}

describe('InventoryAnalysisPanel', () => {
  const originalHash = window.location.hash

  beforeEach(() => {
    mockUser = makeOwnerUser()
    mockUseAiAssistantInventory.mockReturnValue(defaultHookState())
    window.location.hash = ''
  })

  afterEach(() => {
    window.location.hash = originalHash
  })

  it('shows the critical-attention description when there is a critical stock issue', () => {
    render(<InventoryAnalysisPanel summary={makeSummary({ emptyStock: 2 })} />)
    expect(screen.getByText(/há itens que requerem atenção/i)).toBeInTheDocument()
  })

  it('shows the neutral description when there is nothing critical', () => {
    render(<InventoryAnalysisPanel summary={makeSummary()} />)
    expect(screen.getByText(/alertas e situação atual dos produtos/i)).toBeInTheDocument()
  })

  it('allows generation for OWNER users', () => {
    mockUser = makeOwnerUser()
    render(<InventoryAnalysisPanel summary={makeSummary()} />)
    expect(screen.getByText('Análise do estoque')).toBeInTheDocument()
  })

  it('does not allow generation for non-OWNER users', () => {
    mockUser = makeDentistUser()
    render(<InventoryAnalysisPanel summary={makeSummary()} />)
    expect(screen.getByText(/nenhuma análise disponível/i)).toBeInTheDocument()
  })

  it('passes the dataReadiness reason as the disabled reason when data is not ready', () => {
    mockUseAiAssistantInventory.mockReturnValue(
      defaultHookState({ dataReadiness: { ready: false, reason: 'Sem dados suficientes.' } }),
    )
    render(<InventoryAnalysisPanel summary={makeSummary()} />)
    expect(screen.getByText('Sem dados suficientes.')).toBeInTheDocument()
  })

  it('scrolls into view and focuses the section when the URL hash matches', async () => {
    window.location.hash = '#inventory-ai-analysis'
    const scrollIntoViewSpy = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewSpy

    render(<InventoryAnalysisPanel summary={makeSummary()} />)
    await new Promise((r) => setTimeout(r, 10))

    expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('does not scroll into view when the URL hash does not match', async () => {
    window.location.hash = '#something-else'
    const scrollIntoViewSpy = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewSpy

    render(<InventoryAnalysisPanel summary={makeSummary()} />)
    await new Promise((r) => setTimeout(r, 10))

    expect(scrollIntoViewSpy).not.toHaveBeenCalled()
  })

  it('does not scroll into view while still loading the initial analysis', async () => {
    window.location.hash = '#inventory-ai-analysis'
    mockUseAiAssistantInventory.mockReturnValue(defaultHookState({ isLoadingInitial: true }))
    const scrollIntoViewSpy = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoViewSpy

    render(<InventoryAnalysisPanel summary={makeSummary()} />)
    await new Promise((r) => setTimeout(r, 10))

    expect(scrollIntoViewSpy).not.toHaveBeenCalled()
  })
})
