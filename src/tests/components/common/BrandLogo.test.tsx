import { render, screen } from '@/test-utils/render-utils'

import { BrandLogo } from '@/components/common/BrandLogo'

let mockPathname = '/app/pacientes'
let mockThemeMode: 'light' | 'dark' = 'light'

vi.mock('@tanstack/react-router', () => ({
  useRouterState: ({ select }: { select: (s: { location: { pathname: string } }) => string }) =>
    select({ location: { pathname: mockPathname } }),
}))

vi.mock('@/features/theme/useTheme', () => ({
  useTheme: () => ({ theme: mockThemeMode, setTheme: vi.fn() }),
}))

describe('BrandLogo', () => {
  beforeEach(() => {
    mockPathname = '/app/pacientes'
    mockThemeMode = 'light'
  })

  it('renders the light logo on public routes even when theme is dark', () => {
    mockPathname = '/'
    mockThemeMode = 'dark'
    render(<BrandLogo />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/logo-without-bg.png')
  })

  it('renders the dark logo on an /app route with dark theme', () => {
    mockPathname = '/app/pacientes'
    mockThemeMode = 'dark'
    render(<BrandLogo />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/logo-dark-mode-without-bg.png')
  })

  it('renders the light logo on an /app route with light theme', () => {
    mockPathname = '/app/pacientes'
    mockThemeMode = 'light'
    render(<BrandLogo />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/logo-without-bg.png')
  })

  it('renders the light logo on a force-light /app route even with dark theme', () => {
    mockPathname = '/app/assinatura'
    mockThemeMode = 'dark'
    render(<BrandLogo />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/logo-without-bg.png')
  })

  it('forces the dark logo when forceDark is explicitly true, regardless of route/theme', () => {
    mockPathname = '/'
    mockThemeMode = 'light'
    render(<BrandLogo forceDark />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/logo-dark-mode-without-bg.png')
  })

  it('treats forceDark={false} the same as omitting it (automatic detection)', () => {
    mockPathname = '/app/pacientes'
    mockThemeMode = 'dark'
    render(<BrandLogo forceDark={false} />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/logo-dark-mode-without-bg.png')
  })

  it('uses the company trade name as alt text', () => {
    render(<BrandLogo />)
    expect(screen.getByRole('img').getAttribute('alt')).toBeTruthy()
  })
})
