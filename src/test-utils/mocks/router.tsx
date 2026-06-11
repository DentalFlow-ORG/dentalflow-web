import type { AnchorHTMLAttributes, ReactNode } from 'react'

export const mockNavigate = vi.fn()

const _state = {
  pathname: '/app',
  search: {} as Record<string, unknown>,
}

export const setMockPathname = (p: string): void => {
  _state.pathname = p
}

export const setMockSearch = (v: Record<string, unknown>): void => {
  _state.search = v
}

export const resetRouterMocks = (): void => {
  mockNavigate.mockReset()
  _state.pathname = '/app'
  _state.search = {}
}

export function createRouterMock() {
  return {
    Link: ({
      children,
      to,
      ...props
    }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; to: string }) => (
      <a href={String(to)} {...props}>
        {children}
      </a>
    ),
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={String(to)} />,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: _state.pathname }),
    useRouterState: ({
      select,
    }: {
      select: (s: { location: { pathname: string } }) => string
    }) => select({ location: { pathname: _state.pathname } }),
    useSearch: () => _state.search,
  }
}
