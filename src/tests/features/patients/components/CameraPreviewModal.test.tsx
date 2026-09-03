import userEvent from '@testing-library/user-event'

import { render, screen, waitFor } from '@/test-utils/render-utils'

import { CameraPreviewModal } from '@/features/patients/components/CameraPreviewModal'

const mockDrawImage = vi.fn()
const mockToBlob = vi.fn((callback: (blob: Blob | null) => void) =>
  callback(new Blob(['x'], { type: 'image/jpeg' })),
)
const mockContext = { drawImage: mockDrawImage }
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => mockContext),
  toBlob: mockToBlob,
}

const originalCreateElement = document.createElement.bind(document)
const mockStop = vi.fn()
const mockGetTracks = vi.fn(() => [{ stop: mockStop }])
const mockStream = { getTracks: mockGetTracks }
const mockGetUserMedia = vi.fn()

beforeAll(() => {
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') return mockCanvas as unknown as HTMLElement
    return originalCreateElement(tag)
  })
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia: mockGetUserMedia },
  })
})

afterAll(() => {
  vi.restoreAllMocks()
})

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUserMedia.mockResolvedValue(mockStream)
  mockCanvas.getContext.mockReturnValue(mockContext)
  mockToBlob.mockImplementation((callback: (blob: Blob | null) => void) =>
    callback(new Blob(['x'], { type: 'image/jpeg' })),
  )
})

describe('CameraPreviewModal', () => {
  it('renders nothing when closed', () => {
    render(<CameraPreviewModal open={false} onCapture={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByText('Tirar foto')).not.toBeInTheDocument()
  })

  it('requests camera access and shows the video preview once ready', async () => {
    render(<CameraPreviewModal open onCapture={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Tirar foto')).toBeInTheDocument()
    await waitFor(() =>
      expect(mockGetUserMedia).toHaveBeenCalledWith({ video: true, audio: false }),
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /capturar foto/i })).toBeEnabled(),
    )
  })

  it('shows a permission-denied message for NotAllowedError', async () => {
    const err = new Error('denied')
    err.name = 'NotAllowedError'
    mockGetUserMedia.mockRejectedValue(err)
    render(<CameraPreviewModal open onCapture={vi.fn()} onCancel={vi.fn()} />)
    expect(
      await screen.findByText(
        'Permissão de câmera negada. Verifique as configurações do navegador.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /capturar foto/i })).not.toBeInTheDocument()
  })

  it('shows a not-found message for NotFoundError', async () => {
    const err = new Error('none')
    err.name = 'NotFoundError'
    mockGetUserMedia.mockRejectedValue(err)
    render(<CameraPreviewModal open onCapture={vi.fn()} onCancel={vi.fn()} />)
    expect(
      await screen.findByText('Nenhuma câmera encontrada. Conecte uma câmera e tente novamente.'),
    ).toBeInTheDocument()
  })

  it('shows a generic error message for an unexpected error', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('weird'))
    render(<CameraPreviewModal open onCapture={vi.fn()} onCancel={vi.fn()} />)
    expect(await screen.findByText('Não foi possível acessar a câmera.')).toBeInTheDocument()
  })

  it('shows a generic error message for a rejection that is not an Error instance', async () => {
    mockGetUserMedia.mockRejectedValue('some string rejection')
    render(<CameraPreviewModal open onCapture={vi.fn()} onCancel={vi.fn()} />)
    expect(await screen.findByText('Não foi possível acessar a câmera.')).toBeInTheDocument()
  })

  it('captures a frame and calls onCapture with a File, stopping the stream', async () => {
    const onCapture = vi.fn()
    render(<CameraPreviewModal open onCapture={onCapture} onCancel={vi.fn()} />)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /capturar foto/i })).toBeEnabled(),
    )

    await userEvent.click(screen.getByRole('button', { name: /capturar foto/i }))

    expect(mockDrawImage).toHaveBeenCalled()
    expect(onCapture).toHaveBeenCalledWith(expect.any(File))
    expect(mockStop).toHaveBeenCalled()
  })

  it('calls onCancel and stops the stream when Cancelar is clicked', async () => {
    const onCancel = vi.fn()
    render(<CameraPreviewModal open onCapture={vi.fn()} onCancel={onCancel} />)
    await waitFor(() => expect(mockGetUserMedia).toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('stops the stream and resets state when closed while active', async () => {
    const { rerender } = render(<CameraPreviewModal open onCapture={vi.fn()} onCancel={vi.fn()} />)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /capturar foto/i })).toBeEnabled(),
    )

    rerender(<CameraPreviewModal open={false} onCapture={vi.fn()} onCancel={vi.fn()} />)
    expect(mockStop).toHaveBeenCalled()
  })

  it('stops in-flight stream tracks if the modal closes before getUserMedia resolves', async () => {
    let resolveMedia: (stream: unknown) => void = () => {}
    mockGetUserMedia.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMedia = resolve
        }),
    )
    const { rerender } = render(<CameraPreviewModal open onCapture={vi.fn()} onCancel={vi.fn()} />)
    rerender(<CameraPreviewModal open={false} onCapture={vi.fn()} onCancel={vi.fn()} />)

    resolveMedia(mockStream)
    await Promise.resolve()
    expect(mockStop).toHaveBeenCalled()
  })
})
