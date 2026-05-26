import { render, screen } from '@/test/render-utils'

import { AnnualAvailabilityNote } from './AnnualAvailabilityNote'

const NOTE_TEXT = 'Plano anual sujeito à disponibilidade no momento da contratação.'

describe('AnnualAvailabilityNote', () => {
  it('renders the note text when visible=true', () => {
    render(<AnnualAvailabilityNote visible={true} />)
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument()
  })

  it('keeps the note text in the DOM when visible=false (CSS-only hide)', () => {
    render(<AnnualAvailabilityNote visible={false} />)
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument()
  })

  it('renders the note text with variant="dark"', () => {
    render(<AnnualAvailabilityNote visible={true} variant="dark" />)
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument()
  })
})
