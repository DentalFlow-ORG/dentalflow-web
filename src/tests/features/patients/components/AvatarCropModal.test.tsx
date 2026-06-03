import { render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'
import { AvatarCropModal } from '@/features/patients/components/AvatarCropModal'

// ── Canvas mock ───────────────────────────────────────────────────────────────
// jsdom has no real canvas; mock document.createElement('canvas') so the
// export path can run without errors.

const mockDrawImage = vi.fn()
const mockFillRect  = vi.fn()
const mockToDataURL = vi.fn(() => 'data:image/jpeg;base64,EXPORTED')
const mockGetContext = vi.fn(() => ({ drawImage: mockDrawImage, fillRect: mockFillRect }))
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: mockGetContext,
  toDataURL: mockToDataURL,
}

const originalCreateElement = document.createElement.bind(document)
beforeAll(() => {
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') return mockCanvas as unknown as HTMLElement
    return originalCreateElement(tag)
  })
})
afterAll(() => {
  vi.restoreAllMocks()
})

// URL mocks so createObjectURL/revokeObjectURL don't throw in jsdom
beforeAll(() => {
  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:mocked'),
    revokeObjectURL: vi.fn(),
  })
})

beforeEach(() => {
  vi.clearAllMocks()
  mockToDataURL.mockReturnValue('data:image/jpeg;base64,EXPORTED')
  mockGetContext.mockReturnValue({ drawImage: mockDrawImage, fillRect: mockFillRect })
})

// ── Helpers ───────────────────────────────────────────────────────────────────

const MOCK_FILE = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })

function renderModal(overrides: {
  open?: boolean
  onConfirm?: (b: string) => void
  onCancel?: () => void
  onError?: (m: string) => void
  patientName?: string
} = {}) {
  const onConfirm = overrides.onConfirm ?? vi.fn()
  const onCancel = overrides.onCancel ?? vi.fn()
  const onError = overrides.onError ?? vi.fn()
  render(
    <AvatarCropModal
      open={overrides.open ?? true}
      imageFile={MOCK_FILE}
      patientName={overrides.patientName}
      onConfirm={onConfirm}
      onCancel={onCancel}
      onError={onError}
    />,
  )
  return { onConfirm, onCancel, onError }
}

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('AvatarCropModal — rendering', () => {
  it('renders the dialog title when open', () => {
    renderModal()
    expect(screen.getByText(/Ajustar foto do paciente/i)).toBeInTheDocument()
  })

  it('includes the patient name in the title when provided', () => {
    renderModal({ patientName: 'Maria' })
    expect(screen.getByText(/Ajustar foto de Maria/i)).toBeInTheDocument()
  })

  it('renders Cancelar and Salvar foto buttons', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salvar foto/i })).toBeInTheDocument()
  })

  it('renders zoom-in and zoom-out buttons', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /Aumentar zoom/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Reduzir zoom/i })).toBeInTheDocument()
  })

  it('shows 100% zoom by default', () => {
    renderModal()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    renderModal({ open: false })
    expect(screen.queryByText(/Ajustar foto/i)).not.toBeInTheDocument()
  })
})

// ── Crop overlay ──────────────────────────────────────────────────────────────

describe('AvatarCropModal — circular crop overlay', () => {
  it('renders the dimming overlay element for the circular crop mask', () => {
    renderModal()
    expect(screen.getByTestId('crop-circle-overlay')).toBeInTheDocument()
  })

  it('crop area container is not rounded-full (square viewport with overlay, not clipped circle)', () => {
    renderModal()
    const overlay = screen.getByTestId('crop-circle-overlay')
    const container = overlay.parentElement!
    expect(container.className).not.toContain('rounded-full')
  })

  it('crop area container has overflow-hidden', () => {
    renderModal()
    const overlay = screen.getByTestId('crop-circle-overlay')
    const container = overlay.parentElement!
    expect(container.className).toContain('overflow-hidden')
  })
})

// ── Zoom controls ─────────────────────────────────────────────────────────────

describe('AvatarCropModal — zoom controls', () => {
  it('increases zoom when + is clicked', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Aumentar zoom/i }))
    expect(screen.getByText('110%')).toBeInTheDocument()
  })

  it('decreases zoom when - is clicked after zooming in', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Aumentar zoom/i }))
    await user.click(screen.getByRole('button', { name: /Aumentar zoom/i }))
    await user.click(screen.getByRole('button', { name: /Reduzir zoom/i }))
    expect(screen.getByText('110%')).toBeInTheDocument()
  })

  it('zoom-out button is disabled at minimum zoom (100%)', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /Reduzir zoom/i })).toBeDisabled()
  })

  it('zoom-in button is disabled at maximum zoom (300%)', async () => {
    const user = userEvent.setup()
    renderModal()
    // Click 20 times to reach 300% (from 100%, 20 × 10% = 200% increase)
    for (let i = 0; i < 20; i++) {
      await user.click(screen.getByRole('button', { name: /Aumentar zoom/i }))
    }
    expect(screen.getByRole('button', { name: /Aumentar zoom/i })).toBeDisabled()
    expect(screen.getByText('300%')).toBeInTheDocument()
  })
})

// ── Cancel ─────────────────────────────────────────────────────────────────────

describe('AvatarCropModal — cancel', () => {
  it('calls onCancel when the Cancelar button is clicked', async () => {
    const user = userEvent.setup()
    const { onCancel, onConfirm } = renderModal()
    await user.click(screen.getByRole('button', { name: /Cancelar/i }))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onCancel when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const { onCancel } = renderModal()
    await user.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledOnce()
  })
})

// ── Confirm / export ──────────────────────────────────────────────────────────

describe('AvatarCropModal — confirm export', () => {
  it('calls onConfirm with base64 when Salvar foto is clicked', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('EXPORTED')
    })
  })

  it('calls drawImage on the canvas context', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalled())
  })

  it('calls drawImage with 5 arguments: (img, dx, dy, dw, dh)', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalled())
    const args = mockDrawImage.mock.calls[0] as unknown[]
    expect(args).toHaveLength(5)
  })

  it('calls fillRect with white before drawImage to prevent black borders', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockFillRect).toHaveBeenCalled())
    // fillRect must be called before drawImage
    expect(mockFillRect).toHaveBeenCalledBefore(mockDrawImage)
    const fillArgs = mockFillRect.mock.calls[0] as number[]
    expect(fillArgs).toEqual([0, 0, 512, 512])
  })

  it('drawImage destination fills the output canvas for a 1×1 natural image at zoom 1', async () => {
    // In jsdom onLoad never fires, so naturalSize stays {1,1}.
    // baseScale=min(240,240)=240, effectiveScale=240, displayW/H=240, imageLeft/Top=0
    // → dx=0, dy=0, dw=512, dh=512
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalled())
    const args = mockDrawImage.mock.calls[0] as [unknown, number, number, number, number]
    expect(args[1]).toBeCloseTo(0)    // dx
    expect(args[2]).toBeCloseTo(0)    // dy
    expect(args[3]).toBeCloseTo(512)  // dw
    expect(args[4]).toBeCloseTo(512)  // dh
  })

  it('zoom-in increases dw in export (zoomed image takes more canvas space)', async () => {
    const user = userEvent.setup()

    // First save without zoom
    renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalledTimes(1))
    const firstDw = (mockDrawImage.mock.calls[0] as [unknown, number, number, number, number])[3]

    // Reset and save after zooming in
    vi.clearAllMocks()
    mockToDataURL.mockReturnValue('data:image/jpeg;base64,EXPORTED')
    mockGetContext.mockReturnValue({ drawImage: mockDrawImage, fillRect: mockFillRect })
    renderModal()
    await user.click(screen.getByRole('button', { name: /Aumentar zoom/i }))
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalledTimes(1))
    const zoomedDw = (mockDrawImage.mock.calls[0] as [unknown, number, number, number, number])[3]

    // More zoom → image fills more of the canvas → dw increases
    expect(zoomedDw).toBeGreaterThan(firstDw)
  })

  it('calls onError and onCancel when getContext returns null', async () => {
    mockGetContext.mockReturnValueOnce(null as unknown as ReturnType<typeof mockGetContext>)
    const user = userEvent.setup()
    const { onConfirm, onCancel, onError } = renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.stringMatching(/processar a imagem/i))
      expect(onCancel).toHaveBeenCalledOnce()
    })
    expect(onConfirm).not.toHaveBeenCalled()
  })
})

// ── Initial load state ────────────────────────────────────────────────────────

describe('AvatarCropModal — initial image load state', () => {
  it('renders the img element in the DOM (for ref and onLoad) when open with a file', () => {
    renderModal()
    const img = document.querySelector('img[aria-hidden="true"]')
    expect(img).not.toBeNull()
  })

  it('image element has opacity:0 before onLoad fires (no distorted flash)', () => {
    // In jsdom, img.onLoad never fires for blob URLs, so naturalLoaded stays false.
    renderModal()
    const img = document.querySelector('img[aria-hidden="true"]') as HTMLImageElement
    expect(img).not.toBeNull()
    expect(img.style.opacity).toBe('0')
  })

  it('zoom controls still work before image load completes', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Aumentar zoom/i }))
    expect(screen.getByText('110%')).toBeInTheDocument()
  })
})
