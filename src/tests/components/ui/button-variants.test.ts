import { buttonVariants } from '@/components/ui/button-variants'

describe('buttonVariants — default', () => {
  const cls = buttonVariants({ variant: 'default' })

  it('includes bg-primary base class', () => {
    expect(cls).toContain('bg-primary')
  })

  it('includes text-primary-foreground base class', () => {
    expect(cls).toContain('text-primary-foreground')
  })

  it('includes hover:-translate-y-px lift effect', () => {
    expect(cls).toContain('hover:-translate-y-px')
  })

  it('includes dark:hover:bg-primary/85 for dark mode hover fix', () => {
    expect(cls).toContain('dark:hover:bg-primary/85')
  })

  it('includes hover:bg-primary/80 for light mode hover improvement', () => {
    expect(cls).toContain('hover:bg-primary/80')
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

  it('includes hover:bg-destructive/25 (improved from /20)', () => {
    expect(cls).toContain('hover:bg-destructive/25')
  })

  it('includes dark:hover:bg-destructive/45 (improved dark hover)', () => {
    expect(cls).toContain('dark:hover:bg-destructive/45')
  })
})

describe('buttonVariants — focus-visible and disabled preserved', () => {
  const cls = buttonVariants({ variant: 'default' })

  it('includes focus-visible ring class', () => {
    expect(cls).toContain('focus-visible:ring-3')
  })

  it('includes disabled:opacity-50', () => {
    expect(cls).toContain('disabled:opacity-50')
  })

  it('includes disabled:pointer-events-none', () => {
    expect(cls).toContain('disabled:pointer-events-none')
  })
})
