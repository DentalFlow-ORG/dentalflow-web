import { render, screen } from '@/test/render-utils'

import { AnnualAvailabilityNote } from './AnnualAvailabilityNote'

const NOTE_TEXT = 'Plano anual sujeito à disponibilidade no momento da contratação.'

describe('AnnualAvailabilityNote', () => {
  it('is visible to assistive technologies when visible=true', () => {
    render(<AnnualAvailabilityNote visible={true} />)
    const note = screen.getByText(NOTE_TEXT)
    expect(note.closest('[aria-hidden]')).toBeNull()
  })

  it('is hidden from assistive technologies when visible=false', () => {
    render(<AnnualAvailabilityNote visible={false} />)
    const note = screen.getByText(NOTE_TEXT)
    expect(note.closest('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('renders the note text with variant="dark"', () => {
    render(<AnnualAvailabilityNote visible={true} variant="dark" />)
    expect(screen.getByText(NOTE_TEXT)).toBeInTheDocument()
  })
})
