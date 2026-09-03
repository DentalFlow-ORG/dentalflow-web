import { render, screen } from '@/test-utils/render-utils'

import { AuthInfoPanel } from '@/features/auth/components/AuthInfoPanel'

describe('AuthInfoPanel', () => {
  it('renders the marketing heading and all trust points', () => {
    render(<AuthInfoPanel />)
    expect(screen.getByRole('heading', { name: /sua clínica no flow/i })).toBeInTheDocument()
    expect(screen.getByText('Rotina centralizada')).toBeInTheDocument()
    expect(screen.getByText('Acesso protegido')).toBeInTheDocument()
    expect(screen.getByText('Dados consistentes')).toBeInTheDocument()
  })

  it('renders the company brand slogan', () => {
    render(<AuthInfoPanel />)
    expect(screen.getByText('Pensado para clínicas')).toBeInTheDocument()
  })
})
