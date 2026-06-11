import { buttonVariants } from '@/components/ui/button-variants'

describe('buttonVariants — default', () => {
  const cls = buttonVariants({ variant: 'default' })

  it('includes text-primary-foreground', () => {
    expect(cls).toContain('text-primary-foreground')
  })

  it('uses gradient background (bg-gradient-to-b)', () => {
    expect(cls).toContain('bg-gradient-to-b')
  })

  it('gradient starts at from-primary', () => {
    expect(cls).toContain('from-primary')
  })

  it('gradient ends at to-primary/80 for depth at rest', () => {
    expect(cls).toContain('to-primary/80')
  })

  it('includes border accent for definition', () => {
    expect(cls).toContain('border-primary/20')
  })

  it('hover changes gradient stops (from-primary/95)', () => {
    expect(cls).toContain('hover:from-primary/95')
  })

  it('hover end stop changes (to-primary/70)', () => {
    expect(cls).toContain('hover:to-primary/70')
  })

  it('hover includes lift effect (-translate-y-px)', () => {
    expect(cls).toContain('hover:-translate-y-px')
  })

  it('dark mode hover changes gradient start', () => {
    expect(cls).toContain('dark:hover:from-primary/90')
  })

  it('dark mode hover deepens shadow', () => {
    expect(cls).toContain('dark:hover:shadow-lg')
  })
})

describe('buttonVariants — outline', () => {
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
