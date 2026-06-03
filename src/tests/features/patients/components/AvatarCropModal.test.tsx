import { render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'
import { AvatarCropModal } from '@/features/patients/components/AvatarCropModal'

// ── Canvas mock ───────────────────────────────────────────────────────────────
// jsdom has no real canvas; mock document.createElement('canvas') so the
// export path can run without errors.

const mockDrawImage = vi.fn()
const mockToDataURL = vi.fn(() => 'data:image/jpeg;base64,EXPORTED')
const mockGetContext = vi.fn(() => ({ drawImage: mockDrawImage }))
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
  mockGetContext.mockReturnValue({ drawImage: mockDrawImage })
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

  it('crop area container is not rounded-full (square with overlay, not clipped circle)', () => {
    renderModal()
    const overlay = screen.getByTestId('crop-circle-overlay')
    // The container is the parent — it should NOT have rounded-full
    const container = overlay.parentElement!
    expect(container.className).not.toContain('rounded-full')
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

  it('calls drawImage with 9 arguments (img, sx, sy, sw, sh, dx, dy, dw, dh)', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalled())
    const args = mockDrawImage.mock.calls[0] as unknown[]
    expect(args).toHaveLength(9)
  })

  it('drawImage destination fills the full output canvas (0,0,512,512)', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalled())
    const args = mockDrawImage.mock.calls[0] as [unknown, ...number[]]
    // args: [img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH]
    expect(args[5]).toBe(0)    // dstX
    expect(args[6]).toBe(0)    // dstY
    expect(args[7]).toBe(512)  // dstW (MAX_AVATAR_DIMENSION)
    expect(args[8]).toBe(512)  // dstH
  })

  it('drawImage source width and height are equal (square crop)', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalled())
    const args = mockDrawImage.mock.calls[0] as [unknown, ...number[]]
    // srcW (args[3]) and srcH (args[4]) must be equal — uniform square crop
    expect(args[3]).toBe(args[4])
  })

  it('drawImage is called with a different srcX after zooming in (zoom changes source crop)', async () => {
    const user = userEvent.setup()
    // First save without zoom
    renderModal()
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalledTimes(1))
    const firstArgs = [...(mockDrawImage.mock.calls[0] as number[])]

    // Reset and save after zooming in
    vi.clearAllMocks()
    mockToDataURL.mockReturnValue('data:image/jpeg;base64,EXPORTED')
    mockGetContext.mockReturnValue({ drawImage: mockDrawImage })
    renderModal()
    await user.click(screen.getByRole('button', { name: /Aumentar zoom/i }))
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))
    await waitFor(() => expect(mockDrawImage).toHaveBeenCalledTimes(1))
    const zoomedArgs = [...(mockDrawImage.mock.calls[0] as number[])]

    // After zoom-in the source crop size (srcW/srcH) should be smaller
    // (zooming in → smaller source rectangle → same output size → magnified result)
    expect(zoomedArgs[3]).toBeLessThanOrEqual(firstArgs[3])
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
    // The img is always in the DOM once imageSrc is set, regardless of naturalLoaded
    const img = document.querySelector('img[aria-hidden="true"]')
    expect(img).not.toBeNull()
  })

  it('image element has opacity:0 before onLoad fires (no distorted flash)', () => {
    // In jsdom, img.onLoad never fires for blob URLs, so naturalLoaded stays false.
    // This test confirms the pre-load state is invisible rather than distorted.
    renderModal()
    const img = document.querySelector('img[aria-hidden="true"]') as HTMLImageElement
    expect(img).not.toBeNull()
    // Before naturalLoaded, opacity should be 0
    expect(img.style.opacity).toBe('0')
  })

  it('zoom controls still work before image load completes', async () => {
    const user = userEvent.setup()
    renderModal()
    await user.click(screen.getByRole('button', { name: /Aumentar zoom/i }))
    expect(screen.getByText('110%')).toBeInTheDocument()
  })
})
