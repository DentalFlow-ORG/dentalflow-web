import { render, screen } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

import { SubscriptionOnlyShell } from '@/components/layout/SubscriptionOnlyShell'
import { makeOwnerUser } from '@/test-utils/factories/user.factory'
import { mockLogout, resetAuthMocks, setMockAuthState } from '@/test-utils/mocks/auth'
import { mockNavigate, resetRouterMocks } from '@/test-utils/mocks/router'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

vi.mock('@/features/auth/hooks/useAuth', async () => {
  const authMock = await import('@/test-utils/mocks/auth')
  return authMock.createUseAuthMock()
})

vi.mock('@/components/brand/BrandLink', () => ({
  BrandLink: () => <div data-testid="brand-link" />,
}))

describe('SubscriptionOnlyShell', () => {
  beforeEach(() => {
    resetAuthMocks()
    resetRouterMocks()
  })

  it('renders children', () => {
    render(
      <SubscriptionOnlyShell>
        <p>Conteúdo</p>
      </SubscriptionOnlyShell>,
    )
    expect(screen.getByText('Conteúdo')).toBeInTheDocument()
  })

  it('does not render user info when there is no user', () => {
    setMockAuthState({ user: null })
    render(
      <SubscriptionOnlyShell>
        <p>x</p>
      </SubscriptionOnlyShell>,
    )
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
  })

  it('renders the user name and email when authenticated', () => {
    const user = makeOwnerUser({ firstName: 'Ana', lastName: 'Martins', email: 'ana@clinica.com' })
    setMockAuthState({ user })
    render(
      <SubscriptionOnlyShell>
        <p>x</p>
      </SubscriptionOnlyShell>,
    )
    expect(screen.getByText('Ana Martins')).toBeInTheDocument()
    expect(screen.getByText('ana@clinica.com')).toBeInTheDocument()
  })

  it('logs out and navigates to "/" when the Sair button is clicked', async () => {
    mockLogout.mockResolvedValue(undefined)
    render(
      <SubscriptionOnlyShell>
        <p>x</p>
      </SubscriptionOnlyShell>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))
    expect(mockLogout).toHaveBeenCalledOnce()
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/' })
  })
})
