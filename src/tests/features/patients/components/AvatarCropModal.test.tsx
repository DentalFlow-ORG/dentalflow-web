import { AvatarCropModal } from '@/features/patients/components/AvatarCropModal'
import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'

const mockDrawImage = vi.fn()
const mockFillRect = vi.fn()
const mockSave = vi.fn()
const mockRestore = vi.fn()
const mockTranslate = vi.fn()
const mockRotate = vi.fn()
const mockToDataURL = vi.fn(() => 'data:image/jpeg;base64,EXPORTED')
const mockContext = {
  drawImage: mockDrawImage,
  fillRect: mockFillRect,
  save: mockSave,
  restore: mockRestore,
  translate: mockTranslate,
  rotate: mockRotate,
  fillStyle: '',
}
const mockGetContext = vi.fn(() => mockContext)
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

  vi.stubGlobal('URL', {
    ...URL,
    createObjectURL: vi.fn(() => 'blob:mocked'),
    revokeObjectURL: vi.fn(),
  })

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterAll(() => {
  vi.restoreAllMocks()
})

beforeEach(() => {
  vi.clearAllMocks()
  mockContext.fillStyle = ''
  mockToDataURL.mockReturnValue('data:image/jpeg;base64,EXPORTED')
  mockGetContext.mockReturnValue(mockContext)
})

const MOCK_FILE = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })

function renderModal(
  overrides: {
    open?: boolean
    onConfirm?: (b: string) => void
    onCancel?: () => void
    onError?: (m: string) => void
    patientName?: string
  } = {},
) {
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

function loadImage(width: number, height: number) {
  const img = screen.getByTestId('avatar-crop-image') as HTMLImageElement
  Object.defineProperty(img, 'naturalWidth', { configurable: true, value: width })
  Object.defineProperty(img, 'naturalHeight', { configurable: true, value: height })
  fireEvent.load(img)
  return img
}

describe('AvatarCropModal - rendering', () => {
  it('renders the dialog title when open', () => {
    renderModal()
    expect(screen.getByText(/Ajustar foto do paciente/i)).toBeInTheDocument()
  })

  it('includes the patient name in the title when provided', () => {
    renderModal({ patientName: 'Maria' })
    expect(screen.getByText(/Ajustar foto de Maria/i)).toBeInTheDocument()
  })

  it('renders the updated helper description', () => {
    renderModal()
    expect(screen.getAllByText(/Ajuste o quadrado pelas bordas/i)[0]).toBeInTheDocument()
  })

  it('renders Cancelar and Salvar foto buttons', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Salvar foto/i })).toBeInTheDocument()
  })

  it('does not render zoom controls', () => {
    renderModal()
    expect(screen.queryByRole('button', { name: /Aumentar zoom/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Reduzir zoom/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/100%|110%|300%/)).not.toBeInTheDocument()
  })

  it('renders the rotate-left button', () => {
    renderModal()
    expect(screen.getByRole('button', { name: /Girar para esquerda/i })).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    renderModal({ open: false })
    expect(screen.queryByText(/Ajustar foto/i)).not.toBeInTheDocument()
  })
})

describe('AvatarCropModal - crop stage', () => {
  it('renders a modal-bounded crop stage with overflow hidden', () => {
    renderModal()
    const stage = screen.getByTestId('avatar-crop-stage')

    expect(stage).toBeInTheDocument()
    expect(stage.className).toContain('overflow-hidden')
    expect(stage.style.width).toBe('560px')
    expect(stage.style.height).toBe('500px')
    expect(stage.style.touchAction).toBe('none')
  })

  it('renders the square crop frame and circular mask/ring', () => {
    renderModal()
    expect(screen.getByTestId('crop-square-frame')).toBeInTheDocument()
    expect(screen.getByTestId('crop-circle-overlay')).toBeInTheDocument()
    expect(screen.getByTestId('crop-circle-ring')).toBeInTheDocument()
  })

  it('crop frame keeps the same X/Y size', () => {
    renderModal()
    const frame = screen.getByTestId('crop-square-frame')

    expect(frame.style.width).toBe('420px')
    expect(frame.style.height).toBe('420px')
  })

  it('image is not forced to square dimensions after natural load', () => {
    renderModal()
    const img = loadImage(1200, 800)

    expect(img.style.width).toBe('630px')
    expect(img.style.height).toBe('420px')
    expect(img.style.maxWidth).toBe('none')
  })

  it('image starts invisible before natural dimensions are known', () => {
    renderModal()
    const img = screen.getByTestId('avatar-crop-image')

    expect(img).toBeInTheDocument()
    expect((img as HTMLImageElement).style.opacity).toBe('0')
  })

  it('renders resize handles on the crop square corners', () => {
    renderModal()

    expect(screen.getByTestId('crop-resize-handle-top-left')).toBeInTheDocument()
    expect(screen.getByTestId('crop-resize-handle-top-right')).toBeInTheDocument()
    expect(screen.getByTestId('crop-resize-handle-bottom-left')).toBeInTheDocument()
    expect(screen.getByTestId('crop-resize-handle-bottom-right')).toBeInTheDocument()
  })

  it('resize handles use touch-action none', () => {
    renderModal()
    expect(screen.getByTestId('crop-resize-handle-bottom-right').style.touchAction).toBe('none')
  })

  it('resizing a corner keeps the crop frame square', () => {
    renderModal()
    loadImage(1200, 800)
    const handle = screen.getByTestId('crop-resize-handle-bottom-right')

    fireEvent.pointerDown(handle, { pointerId: 2, clientX: 420, clientY: 420 })
    fireEvent.pointerMove(handle, { pointerId: 2, clientX: 450, clientY: 450 })
    fireEvent.pointerUp(handle, { pointerId: 2, clientX: 450, clientY: 450 })

    const frame = screen.getByTestId('crop-square-frame')
    expect(frame.style.width).toBe(frame.style.height)
    expect(frame.style.width).toBe('480px')
  })
})

describe('AvatarCropModal - rotate left', () => {
  it('clicking rotate-left updates preview rotation to 270 degrees', async () => {
    const user = userEvent.setup()
    renderModal()
    const img = loadImage(1200, 800)

    await user.click(screen.getByRole('button', { name: /Girar para esquerda/i }))

    expect(img.style.transform).toContain('rotate(270deg)')
  })

  it('rotate-left can be clicked repeatedly through 270, 180, 90 and 0', async () => {
    const user = userEvent.setup()
    renderModal()
    const img = loadImage(1200, 800)
    const button = screen.getByRole('button', { name: /Girar para esquerda/i })

    await user.click(button)
    expect(img.style.transform).toContain('rotate(270deg)')
    await user.click(button)
    expect(img.style.transform).toContain('rotate(180deg)')
    await user.click(button)
    expect(img.style.transform).toContain('rotate(90deg)')
    await user.click(button)
    expect(img.style.transform).toContain('rotate(0deg)')
  })
})

describe('AvatarCropModal - cancel', () => {
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

describe('AvatarCropModal - confirm export', () => {
  it('calls onConfirm with base64 when Salvar foto is clicked', async () => {
    const user = userEvent.setup()
    const { onConfirm } = renderModal()
    loadImage(1200, 800)

    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('EXPORTED')
    })
  })

  it('fills the 512x512 output with white before drawing', async () => {
    const user = userEvent.setup()
    renderModal()
    loadImage(1200, 800)

    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))

    await waitFor(() => expect(mockFillRect).toHaveBeenCalledWith(0, 0, 512, 512))
    expect(mockFillRect).toHaveBeenCalledBefore(mockDrawImage)
  })

  it('uses canvas translate and rotate before drawImage', async () => {
    const user = userEvent.setup()
    renderModal()
    loadImage(1200, 800)

    await user.click(screen.getByRole('button', { name: /Girar para esquerda/i }))
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))

    await waitFor(() => expect(mockDrawImage).toHaveBeenCalled())
    expect(mockSave).toHaveBeenCalledBefore(mockTranslate)
    expect(mockTranslate).toHaveBeenCalledWith(256, 256)
    expect(mockRotate).toHaveBeenCalledWith((270 * Math.PI) / 180)
    expect(mockRotate).toHaveBeenCalledBefore(mockDrawImage)
    expect(mockRestore).toHaveBeenCalled()
  })

  it('saving uses the adjusted crop offset after dragging', async () => {
    const user = userEvent.setup()
    renderModal()
    loadImage(1200, 800)
    const stage = screen.getByTestId('avatar-crop-stage')

    fireEvent.pointerDown(stage, { pointerId: 1, clientX: 200, clientY: 200 })
    fireEvent.pointerMove(stage, { pointerId: 1, clientX: 240, clientY: 200 })
    fireEvent.pointerUp(stage, { pointerId: 1, clientX: 240, clientY: 200 })
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))

    await waitFor(() => expect(mockTranslate).toHaveBeenCalled())
    const [translateX, translateY] = mockTranslate.mock.calls[0] as [number, number]
    expect(translateX).toBeGreaterThan(256)
    expect(translateY).toBe(256)
  })

  it('drawImage receives centered destination args for the transformed image', async () => {
    const user = userEvent.setup()
    renderModal()
    loadImage(1200, 800)

    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))

    await waitFor(() => expect(mockDrawImage).toHaveBeenCalled())
    const args = mockDrawImage.mock.calls[0] as [unknown, number, number, number, number]
    expect(args).toHaveLength(5)
    expect(args[1]).toBeCloseTo(-384)
    expect(args[2]).toBeCloseTo(-256)
    expect(args[3]).toBeCloseTo(768)
    expect(args[4]).toBeCloseTo(512)
  })

  it('export uses the resized crop size', async () => {
    const user = userEvent.setup()
    renderModal()
    loadImage(1200, 800)
    const handle = screen.getByTestId('crop-resize-handle-top-left')

    fireEvent.pointerDown(handle, { pointerId: 3, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(handle, { pointerId: 3, clientX: 160, clientY: 160 })
    fireEvent.pointerUp(handle, { pointerId: 3, clientX: 160, clientY: 160 })
    await user.click(screen.getByRole('button', { name: /Salvar foto/i }))

    await waitFor(() => expect(mockDrawImage).toHaveBeenCalled())
    const args = mockDrawImage.mock.calls[0] as [unknown, number, number, number, number]
    expect(args[3]).toBeGreaterThan(768)
    expect(args[4]).toBeGreaterThan(512)
  })

  it('calls onError and onCancel when getContext returns null', async () => {
    mockGetContext.mockReturnValueOnce(null as unknown as typeof mockContext)
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
