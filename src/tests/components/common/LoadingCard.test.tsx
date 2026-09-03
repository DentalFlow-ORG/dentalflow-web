import { render, screen } from '@/test-utils/render-utils'

import { LoadingCard } from '@/components/common/LoadingCard'

describe('LoadingCard', () => {
  it('renders the message inside a status role element', () => {
    render(<LoadingCard message="Carregando dados..." />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados...')
  })
})
