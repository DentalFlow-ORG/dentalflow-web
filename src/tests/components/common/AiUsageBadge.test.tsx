import { render, screen } from '@/test-utils/render-utils'

import { AiUsageBadge } from '@/components/common/AiUsageBadge'
import type { AiQuotaInfo } from '@/lib/ai-types'

function makeQuota(overrides: Partial<AiQuotaInfo> = {}): AiQuotaInfo {
  return {
    allowed: true,
    planKey: 'pro',
    used: 1,
    remaining: 4,
    limit: 5,
    nextResetAt: '2026-07-01T00:00:00.000Z',
    lastGeneratedAt: null,
    blockedReason: null,
    ...overrides,
  }
}

describe('AiUsageBadge', () => {
  it('renders nothing when quota is null', () => {
    const { container } = render(<AiUsageBadge quota={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when quota is not allowed', () => {
    const { container } = render(<AiUsageBadge quota={makeQuota({ allowed: false })} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders usage count in the normal state', () => {
    render(<AiUsageBadge quota={makeQuota({ used: 2, limit: 5, remaining: 3 })} />)
    expect(screen.getByText('2/5 análises este mês')).toBeInTheDocument()
  })

  it('uses singular "análise" when limit is 1', () => {
    render(<AiUsageBadge quota={makeQuota({ used: 1, limit: 1, remaining: 0 })} />)
    expect(screen.getByText('1/1 análise este mês')).toBeInTheDocument()
  })

  it('applies the "full" style when remaining is 0', () => {
    render(<AiUsageBadge quota={makeQuota({ used: 5, limit: 5, remaining: 0 })} />)
    expect(screen.getByText('5/5 análises este mês')).toHaveClass('border-red-200')
  })

  it('applies the "low" style when remaining is 1 and limit > 1', () => {
    render(<AiUsageBadge quota={makeQuota({ used: 4, limit: 5, remaining: 1 })} />)
    expect(screen.getByText('4/5 análises este mês')).toHaveClass('border-amber-200')
  })

  it('sets the title to the blockedReason when present', () => {
    render(<AiUsageBadge quota={makeQuota({ blockedReason: 'Limite excedido' })} />)
    expect(screen.getByText(/análises este mês/)).toHaveAttribute('title', 'Limite excedido')
  })
})
