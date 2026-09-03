import userEvent from '@testing-library/user-event'

import { render, screen } from '@/test-utils/render-utils'

let mockIsMobile = false
vi.mock('@/hooks/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

import { OdontogramChart } from '@/features/clinical-records/components/odontogram/OdontogramChart'
import type { OdontogramTooth } from '@/features/clinical-records/types/clinical-record.types'

function getTooth(): OdontogramTooth {
  return {}
}

describe('OdontogramChart — desktop layout', () => {
  beforeEach(() => {
    mockIsMobile = false
  })

  it('renders all 32 permanent teeth as buttons', () => {
    render(<OdontogramChart getTooth={getTooth} selected={null} />)
    expect(screen.getAllByRole('button')).toHaveLength(32)
  })

  it('renders 20 deciduous teeth when dentitionMode is deciduous', () => {
    render(<OdontogramChart getTooth={getTooth} selected={null} dentitionMode="deciduous" />)
    expect(screen.getAllByRole('button')).toHaveLength(20)
  })

  it('marks the selected tooth', () => {
    render(<OdontogramChart getTooth={getTooth} selected={11} />)
    expect(screen.getByRole('button', { name: /dente 11/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('marks multi-selected teeth', () => {
    render(
      <OdontogramChart getTooth={getTooth} selected={null} multiSelected={new Set([11, 21])} />,
    )
    expect(screen.getByRole('button', { name: /dente 11/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: /dente 21/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('calls onSelect with the clicked tooth number', async () => {
    const onSelect = vi.fn()
    render(<OdontogramChart getTooth={getTooth} selected={null} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    expect(onSelect).toHaveBeenCalledWith(11)
  })

  it('disables all teeth when readOnly', () => {
    render(<OdontogramChart getTooth={getTooth} selected={null} onSelect={vi.fn()} readOnly />)
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
    }
  })
})

describe('OdontogramChart — mobile quadrant layout', () => {
  beforeEach(() => {
    mockIsMobile = true
  })

  it('renders all 32 teeth split across 4 quadrants', () => {
    render(<OdontogramChart getTooth={getTooth} selected={null} />)
    expect(screen.getAllByRole('button')).toHaveLength(32)
    expect(screen.getByText(/quadrante 1/i)).toBeInTheDocument()
    expect(screen.getByText(/quadrante 2/i)).toBeInTheDocument()
    expect(screen.getByText(/quadrante 3/i)).toBeInTheDocument()
    expect(screen.getByText(/quadrante 4/i)).toBeInTheDocument()
  })

  it('still calls onSelect when a tooth is clicked', async () => {
    const onSelect = vi.fn()
    render(<OdontogramChart getTooth={getTooth} selected={null} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /dente 11/i }))
    expect(onSelect).toHaveBeenCalledWith(11)
  })
})

describe('OdontogramChart — print mode', () => {
  it('always renders the permanent dentition, all teeth disabled', () => {
    mockIsMobile = false
    render(
      <OdontogramChart getTooth={getTooth} selected={null} printMode dentitionMode="deciduous" />,
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(32)
    for (const button of buttons) {
      expect(button).toBeDisabled()
    }
  })
})
