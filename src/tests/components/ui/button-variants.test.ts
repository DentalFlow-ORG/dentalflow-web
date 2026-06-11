import { buttonVariants } from '@/components/ui/button-variants'

describe('buttonVariants — default (solid premium style)', () => {
  const cls = buttonVariants({ variant: 'default' })

  it('is solid: includes bg-primary (no gradient)', () => {
    expect(cls).toContain('bg-primary')
    expect(cls).not.toContain('bg-gradient-to-b')
    expect(cls).not.toContain('from-primary')
  })

  it('includes text-primary-foreground for light mode text', () => {
    expect(cls).toContain('text-primary-foreground')
  })

  it('includes border accent for definition', () => {
    expect(cls).toContain('border-primary/25')
  })

  it('includes multi-layer depth shadow', () => {
    expect(cls).toContain('shadow-[')
  })

  it('hover lightens background (hover:bg-primary/90)', () => {
    expect(cls).toContain('hover:bg-primary/90')
  })

  it('hover strengthens border', () => {
    expect(cls).toContain('hover:border-primary/40')
  })

  it('hover deepens shadow', () => {
    expect(cls).toContain('hover:shadow-[')
  })

  it('hover includes subtle lift', () => {
    expect(cls).toContain('hover:-translate-y-px')
  })

  it('dark mode uses clean neutral surface (dark:bg-slate-100)', () => {
    expect(cls).toContain('dark:bg-slate-100')
  })

  it('dark mode text is high contrast (dark:text-slate-950)', () => {
    expect(cls).toContain('dark:text-slate-950')
  })

  it('dark mode hover becomes bright white (dark:hover:bg-white)', () => {
    expect(cls).toContain('dark:hover:bg-white')
  })
})

describe('buttonVariants — outline (unchanged)', () => {
  const cls = buttonVariants({ variant: 'outline' })

  it('includes hover:bg-primary/10 (light mode hover preserved)', () => {
    expect(cls).toContain('hover:bg-primary/10')
  })

  it('includes dark:hover:bg-primary/15 (dark mode hover preserved)', () => {
    expect(cls).toContain('dark:hover:bg-primary/15')
  })
})

describe('buttonVariants — destructive', () => {
  const cls = buttonVariants({ variant: 'destructive' })

  it('includes hover:bg-destructive/25', () => {
    expect(cls).toContain('hover:bg-destructive/25')
  })

  it('includes dark:hover:bg-destructive/45', () => {
    expect(cls).toContain('dark:hover:bg-destructive/45')
  })
})

describe('buttonVariants — base states preserved', () => {
  const cls = buttonVariants({ variant: 'default' })

  it('includes focus-visible ring', () => {
    expect(cls).toContain('focus-visible:ring-3')
  })

  it('includes disabled:opacity-50', () => {
    expect(cls).toContain('disabled:opacity-50')
  })

  it('includes disabled:pointer-events-none', () => {
    expect(cls).toContain('disabled:pointer-events-none')
  })

  it('includes active press translate', () => {
    expect(cls).toContain('active:not-aria-[haspopup]:translate-y-px')
  })
})
