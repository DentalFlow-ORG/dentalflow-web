import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

import { OdontogramTooth } from '@/features/clinical-records/components/odontogram/OdontogramTooth'
import type { OdontogramTooth as OdontogramToothData } from '@/features/clinical-records/types/clinical-record.types'

describe('OdontogramTooth', () => {
  it('renders an accessible label with the tooth number and condition', () => {
    render(<OdontogramTooth toothNumber={11} tooth={{ condition: 'caries' }} onSelect={vi.fn()} />)
    expect(screen.getByRole('button', { name: /dente 11/i })).toBeInTheDocument()
  })

  it('is interactive and calls onSelect when clicked', async () => {
    const onSelect = vi.fn()
    render(<OdontogramTooth toothNumber={21} tooth={{}} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(21)
  })

  it('is disabled when there is no onSelect handler', () => {
    render(<OdontogramTooth toothNumber={21} tooth={{}} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when readOnly', () => {
    render(<OdontogramTooth toothNumber={21} tooth={{}} onSelect={vi.fn()} readOnly />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled in printMode', () => {
    render(<OdontogramTooth toothNumber={21} tooth={{}} onSelect={vi.fn()} printMode />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('reflects the selected state via aria-pressed', () => {
    render(<OdontogramTooth toothNumber={21} tooth={{}} selected onSelect={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('reflects the multiSelected state via aria-pressed', () => {
    render(<OdontogramTooth toothNumber={21} tooth={{}} multiSelected onSelect={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows a condition dot when the tooth has a condition', () => {
    const { container } = render(
      <OdontogramTooth toothNumber={21} tooth={{ condition: 'caries' }} onSelect={vi.fn()} />,
    )
    expect(container.querySelector('.ring-card')).toBeInTheDocument()
  })

  it('does not show a condition dot when the tooth has no condition', () => {
    const { container } = render(<OdontogramTooth toothNumber={21} tooth={{}} onSelect={vi.fn()} />)
    expect(container.querySelector('.ring-card')).not.toBeInTheDocument()
  })

  it('shows a strike-through marker when the tooth is absent', () => {
    const tooth: OdontogramToothData = { condition: 'absent' }
    const { container } = render(
      <OdontogramTooth toothNumber={21} tooth={tooth} onSelect={vi.fn()} />,
    )
    expect(container.querySelector('.-rotate-12')).toBeInTheDocument()
  })
})
