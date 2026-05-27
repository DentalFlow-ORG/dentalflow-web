import { render, renderHook, screen, act } from '@/test/render-utils'

import { useRevealOnScroll } from '@/features/marketing/hooks/useRevealOnScroll'

// ── IntersectionObserver mock helpers ─────────────────────────────────────────

type IOEntry = Pick<IntersectionObserverEntry, 'isIntersecting'>
type IOCallback = (entries: IOEntry[]) => void

let capturedCallback: IOCallback | null = null
let capturedOptions: IntersectionObserverInit | null = null
const mockDisconnect = vi.fn()
const mockObserve = vi.fn()

function fire(isIntersecting: boolean) {
  act(() => { capturedCallback?.([{ isIntersecting }]) })
}

// ── Test component — gives the hook a real DOM node to observe ────────────────

function TestBox({ threshold }: { threshold?: number }) {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>(threshold)
  return <div ref={ref} data-testid="box" data-visible={String(isVisible)} />
}

function isBoxVisible() {
  return screen.getByTestId('box').dataset.visible === 'true'
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  capturedCallback = null
  capturedOptions = null
  mockDisconnect.mockClear()
  mockObserve.mockClear()
  vi.stubGlobal('IntersectionObserver', vi.fn(function (cb: IOCallback, opts: IntersectionObserverInit) {
    capturedCallback = cb
    capturedOptions = opts
    return { observe: mockObserve, disconnect: mockDisconnect }
  }))
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useRevealOnScroll — initial state', () => {
  it('returns isVisible=false before observer fires', () => {
    render(<TestBox />)
    expect(isBoxVisible()).toBe(false)
  })

  it('returns an object with a ref property', () => {
    const { result } = renderHook(() => useRevealOnScroll())
    expect(result.current.ref).toBeDefined()
    expect('current' in result.current.ref).toBe(true)
  })
})

describe('useRevealOnScroll — IntersectionObserver', () => {
  it('creates an observer with the default threshold (0.18)', () => {
    render(<TestBox />)
    expect(IntersectionObserver).toHaveBeenCalledTimes(1)
    expect(capturedOptions?.threshold).toBe(0.18)
  })

  it('creates an observer with a custom threshold', () => {
    render(<TestBox threshold={0.42} />)
    expect(capturedOptions?.threshold).toBe(0.42)
  })

  it('sets isVisible=true when entry.isIntersecting is true', () => {
    render(<TestBox />)
    fire(true)
    expect(isBoxVisible()).toBe(true)
  })

  it('does not set isVisible when entry.isIntersecting is false', () => {
    render(<TestBox />)
    fire(false)
    expect(isBoxVisible()).toBe(false)
  })

  it('disconnects the observer after becoming visible', () => {
    render(<TestBox />)
    fire(true)
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<TestBox />)
    expect(mockDisconnect).not.toHaveBeenCalled()
    unmount()
    expect(mockDisconnect).toHaveBeenCalled()
  })
})

describe('useRevealOnScroll — prefers-reduced-motion', () => {
  it('sets isVisible=true immediately without creating an observer', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    render(<TestBox />)
    expect(isBoxVisible()).toBe(true)
  })

  it('does not create IntersectionObserver when reduced-motion is active', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    render(<TestBox />)
    expect(IntersectionObserver).not.toHaveBeenCalled()
  })
})
