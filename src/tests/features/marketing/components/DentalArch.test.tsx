import { render, screen, userEvent } from '@/test-utils/render-utils'

import { DentalArch } from '@/features/marketing/components/landing/DentalArch'

// The WebGL scene is lazy + decorative — stub it so the static path renders
// without three.js. It is never reached here because matchMedia forces static.
vi.mock('@/features/marketing/components/landing/DentalArchScene', () => ({
  default: () => null,
}))

const originalMatchMedia = window.matchMedia

beforeEach(() => {
  // Force the static (mobile / touch / reduced-motion) fallback path.
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

afterEach(() => {
  window.matchMedia = originalMatchMedia
})

describe('DentalArch (static / mobile fallback)', () => {
  it('renders a tappable button for every workflow icon', () => {
    render(<DentalArch selectedIndex={3} onSelect={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(9)
    expect(screen.getByRole('button', { name: /selecionar módulo agenda/i })).toBeInTheDocument()
  })

  it('reflects the selected module on its icon button', () => {
    render(<DentalArch selectedIndex={3} onSelect={() => {}} />)
    // Agenda is index 3 in DENTAL_WORKFLOWS.
    expect(screen.getByRole('button', { name: /selecionar módulo agenda/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('selects the corresponding module when an icon button is tapped', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<DentalArch selectedIndex={3} onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: /selecionar módulo financeiro/i }))
    expect(onSelect).toHaveBeenCalledWith(2) // financeiro is index 2
  })
})
