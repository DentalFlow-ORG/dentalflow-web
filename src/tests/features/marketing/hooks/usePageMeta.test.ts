import { renderHook } from '@/test-utils/render-utils'

import { usePageMeta } from '@/features/marketing/hooks/usePageMeta'

afterEach(() => {
  document.title = ''
  document.querySelector('meta[name="description"]')?.remove()
})

describe('usePageMeta', () => {
  it('sets document.title to the provided title', () => {
    renderHook(() => usePageMeta('My Page', 'Some description'))
    expect(document.title).toBe('My Page')
  })

  it('sets meta[name="description"] content', () => {
    renderHook(() => usePageMeta('My Page', 'Some description'))
    const meta = document.querySelector('meta[name="description"]')
    expect(meta?.getAttribute('content')).toBe('Some description')
  })

  it('updates title when the argument changes', () => {
    const { rerender } = renderHook(({ title }: { title: string }) => usePageMeta(title, 'desc'), {
      initialProps: { title: 'First Title' },
    })
    expect(document.title).toBe('First Title')
    rerender({ title: 'Second Title' })
    expect(document.title).toBe('Second Title')
  })

  it('creates the meta tag if it does not already exist', () => {
    document.querySelector('meta[name="description"]')?.remove()
    renderHook(() => usePageMeta('T', 'Created description'))
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Created description',
    )
  })
})
