import { render, screen } from '@/test-utils/render-utils'

vi.mock('@tanstack/react-router', async () => {
  const m = await import('@/test-utils/mocks/router')
  return m.createRouterMock()
})

import { RoleSwitcher } from '@/features/marketing/components/RoleSwitcher'

describe('RoleSwitcher', () => {
  it('renders cards for every role except the current path', () => {
    render(<RoleSwitcher currentPath="/para-gestores" />)
    expect(screen.queryByRole('link', { name: /gestor/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /dentista/i })).toHaveAttribute(
      'href',
      '/para-dentistas',
    )
    expect(screen.getByRole('link', { name: /secret/i })).toHaveAttribute(
      'href',
      '/para-secretarias',
    )
    expect(screen.getByRole('link', { name: /abertura/i })).toHaveAttribute(
      'href',
      '/para-clinicas-em-abertura',
    )
  })

  it('renders all 4 cards when the current path matches none of the known roles', () => {
    render(<RoleSwitcher currentPath="/some-other-page" />)
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })
})
