import { render, screen } from '@/test-utils/render-utils'

import { MonthlyUsageBar } from '@/features/notifications/components/MonthlyUsageBar'
import type { NotificationQuota } from '@/features/notifications/types/notifications.types'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

function makeQuota(overrides: Partial<NotificationQuota> = {}): NotificationQuota {
  return { used: 10, limit: 100, available: 90, ...overrides } as NotificationQuota
}

describe('MonthlyUsageBar', () => {
  it('shows used/limit and the progress bar value', () => {
    render(<MonthlyUsageBar quota={makeQuota({ used: 10, limit: 100 })} />)
    expect(screen.getByText('10 / 100 mensagens este mês')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10')
  })

  it('does not show the upgrade CTA when below the near-limit threshold', () => {
    render(<MonthlyUsageBar quota={makeQuota({ used: 10, limit: 100, available: 90 })} />)
    expect(screen.queryByRole('link', { name: /fazer upgrade/i })).not.toBeInTheDocument()
  })

  it('shows the upgrade CTA once at or above 80%', () => {
    render(<MonthlyUsageBar quota={makeQuota({ used: 80, limit: 100, available: 20 })} />)
    expect(screen.getByRole('link', { name: /fazer upgrade/i })).toBeInTheDocument()
  })

  it('hides the upgrade CTA when showUpgradeCta is false, even near the limit', () => {
    render(
      <MonthlyUsageBar
        quota={makeQuota({ used: 90, limit: 100, available: 10 })}
        showUpgradeCta={false}
      />,
    )
    expect(screen.queryByRole('link', { name: /fazer upgrade/i })).not.toBeInTheDocument()
  })

  it('shows the exhausted message and link when available is 0', () => {
    render(<MonthlyUsageBar quota={makeQuota({ used: 100, limit: 100, available: 0 })} />)
    expect(screen.getByText(/limite atingido/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /faça upgrade/i })).toBeInTheDocument()
  })

  it('hides the exhausted upgrade link when showUpgradeCta is false', () => {
    render(
      <MonthlyUsageBar
        quota={makeQuota({ used: 100, limit: 100, available: 0 })}
        showUpgradeCta={false}
      />,
    )
    expect(screen.getByText(/limite atingido/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /faça upgrade/i })).not.toBeInTheDocument()
  })

  it('caps the progress percentage at 100 and handles a zero limit without dividing by zero', () => {
    render(<MonthlyUsageBar quota={makeQuota({ used: 5, limit: 0, available: 0 })} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveStyle({ width: '0%' })
  })
})
