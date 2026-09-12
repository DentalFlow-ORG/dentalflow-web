import { SectionDivider } from '@/features/marketing/components/SectionDivider'
import { render } from '@/test-utils/render-utils'

// The divider blends the section above into the section below, so each variant
// has to paint the two surrounding surfaces. A missing or mismatched config entry
// leaves a visible seam on the landing page, and the element is aria-hidden, so
// nothing else in the suite would notice.

const VARIANTS = [
  ['dark-to-light', 'bg-slate-950', 'bg-white'],
  ['dark-to-gray', 'bg-slate-950', 'bg-slate-50'],
  ['light-to-dark', 'bg-white', 'bg-slate-950'],
  ['gray-to-dark', 'bg-slate-50', 'bg-slate-950'],
  ['light-to-blue', 'bg-white', 'bg-[#0f3b73]'],
  ['gray-to-light', 'bg-slate-50', 'bg-white'],
  ['light-to-gray', 'bg-white', 'bg-slate-50'],
] as const

describe('SectionDivider', () => {
  it.each(VARIANTS)('%s paints the surface above and below', (variant, above, below) => {
    const { container } = render(<SectionDivider variant={variant} />)
    const bands = container.querySelectorAll('.h-6')
    expect(bands).toHaveLength(2)
    expect(bands[0]).toHaveClass(above)
    expect(bands[1]).toHaveClass(below)
  })

  it('is decorative and hidden from assistive technology', () => {
    const { container } = render(<SectionDivider variant="dark-to-light" />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('merges an extra className onto the root', () => {
    const { container } = render(<SectionDivider variant="dark-to-light" className="my-10" />)
    expect(container.firstChild).toHaveClass('relative', 'my-10')
  })
})
