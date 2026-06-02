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
