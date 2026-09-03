import { render, screen } from '@/test-utils/render-utils'

import { FullPageSpinner } from '@/components/common/FullPageSpinner'

describe('FullPageSpinner', () => {
  it('renders the message inside a status role element', () => {
    render(<FullPageSpinner message="Carregando..." />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando...')
  })
})
