import { fireEvent, render, screen, waitFor, within } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'
import {
  PatientAvatarWidget,
  getAvatarInitials,
} from '@/features/patients/components/PatientAvatarWidget'

// ── Mock AvatarCropModal to isolate widget behaviour from canvas/image ops ────
// The modal's own rendering and crop export are tested in AvatarCropModal.test.tsx.

vi.mock('@/features/patients/components/AvatarCropModal', () => ({
  AvatarCropModal: ({
    open,
    onConfirm,
    onCancel,
    onError,
    patientName,
  }: {
    open: boolean
    onConfirm: (base64: string) => void
    onCancel: () => void
    onError?: (msg: string) => void
    imageFile: File | null
    patientName?: string
  }) =>
    open ? (
      <div data-testid="avatar-crop-modal" aria-label={`Ajustar foto${patientName ? ` de ${patientName}` : ''}`}>
        <button type="button" onClick={() => onConfirm('CROPPED_BASE64')}>
          Salvar foto
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" onClick={() => onError?.('canvas falhou')}>
          Trigger Error
        </button>
      </div>
    ) : null,
}))

// ── Mock CameraPreviewModal to isolate widget from webcam/video ops ───────────
// The modal's own rendering and capture flow are tested in CameraPreviewModal.test.tsx.

vi.mock('@/features/patients/components/CameraPreviewModal', () => ({
  CameraPreviewModal: ({
    open,
    onCapture,
    onCancel,
  }: {
    open: boolean
    onCapture: (file: File) => void
    onCancel: () => void
  }) =>
    open ? (
      <div data-testid="camera-preview-modal">
        <button
          type="button"
          onClick={() => onCapture(new File(['webcam'], 'webcam.jpg', { type: 'image/jpeg' }))}
        >
          Capturar foto
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar câmera
        </button>
      </div>
    ) : null,
}))

// ── getUserMedia mock ─────────────────────────────────────────────────────────

const mockGetUserMedia = vi.fn()

beforeAll(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: mockGetUserMedia },
    configurable: true,
    writable: true,
  })
})

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUserMedia.mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }],
  } as unknown as MediaStream)
  ;(navigator.mediaDevices as unknown as { getUserMedia: typeof mockGetUserMedia }).getUserMedia =
    mockGetUserMedia
})

// ── getAvatarInitials unit tests ──────────────────────────────────────────────

describe('getAvatarInitials', () => {
  it('returns ? for an empty name', () => {
    expect(getAvatarInitials('')).toBe('?')
  })

  it('returns first two letters for a single-word name', () => {
    expect(getAvatarInitials('Ana')).toBe('AN')
  })

  it('returns first letter of first and last word for a multi-word name', () => {
    expect(getAvatarInitials('João Silva')).toBe('JS')
    expect(getAvatarInitials('Maria  de  Souza')).toBe('MS')
  })
})

// ── Display-only (no onUpload) ────────────────────────────────────────────────

describe('PatientAvatarWidget — display-only', () => {
  it('shows initials when no avatarUrl is provided', () => {
    render(<PatientAvatarWidget name="João Silva" />)
    expect(document.body.textContent).toContain('JS')
  })

  it('renders an img when avatarUrl is provided', () => {
    render(<PatientAvatarWidget name="Ana Luz" avatarUrl="abc123" />)
    const img = document.querySelector('img') as HTMLImageElement
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,abc123')
    expect(img).toHaveAttribute('alt', 'Ana Luz')
  })

  it('does not render an upload button when onUpload is absent', () => {
    render(<PatientAvatarWidget name="João Silva" />)
    expect(
      screen.queryByRole('button', { name: /adicionar foto|alterar foto/i }),
    ).not.toBeInTheDocument()
  })

  it('does not render a remove option when onUpload is absent', () => {
    render(<PatientAvatarWidget name="João Silva" avatarUrl="abc123" />)
    // No interactive buttons at all when display-only
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

// ── Interactive (onUpload provided) ──────────────────────────────────────────

describe('PatientAvatarWidget — interactive', () => {
  it('renders an upload button when onUpload is provided', () => {
    render(<PatientAvatarWidget name="João Silva" onUpload={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: /adicionar foto do paciente/i }),
    ).toBeInTheDocument()
  })

  it('labels the upload button as "Alterar foto" when a photo already exists', () => {
    render(<PatientAvatarWidget name="Ana" avatarUrl="abc123" onUpload={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: /alterar foto do paciente/i }),
    ).toBeInTheDocument()
  })

  it('does NOT render a standalone border remove button — remove lives in the picker', () => {
    render(<PatientAvatarWidget name="Ana" avatarUrl="abc123" onUpload={vi.fn()} />)
    // Only one button: the main avatar circle button (no separate X on the border)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
  })

  it('calls onUpload(null) when "Remover foto" is selected in the picker', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    render(<PatientAvatarWidget name="Ana" avatarUrl="abc123" onUpload={onUpload} />)
    // Open picker
    await user.click(screen.getByRole('button', { name: /alterar foto do paciente/i }))
    // Click "Remover foto" in the picker
    await user.click(screen.getByRole('menuitem', { name: /Remover foto/i }))
    expect(onUpload).toHaveBeenCalledWith(null)
  })
})

// ── Source picker ─────────────────────────────────────────────────────────────

describe('PatientAvatarWidget — source picker (no photo)', () => {
  it('shows "Enviar imagem" and "Tirar foto" when no photo exists', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    const menu = screen.getByRole('menu', { name: /Selecionar origem da foto/i })
    expect(within(menu).getByRole('menuitem', { name: /Enviar imagem/i })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: /Tirar foto/i })).toBeInTheDocument()
    expect(within(menu).queryByRole('menuitem', { name: /Remover foto/i })).not.toBeInTheDocument()
  })

  it('"Tirar foto" is always visible in the picker when no photo — not hidden on desktop', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    const menu = screen.getByRole('menu', { name: /Selecionar origem da foto/i })
    const cameraBtn = within(menu).getByRole('menuitem', { name: /Tirar foto/i })
    expect(cameraBtn).toBeInTheDocument()
    expect(cameraBtn).not.toHaveClass('hidden')
    expect(cameraBtn).not.toHaveClass('sr-only')
  })
})

describe('PatientAvatarWidget — source picker (has photo)', () => {
  it('shows "Trocar foto", "Tirar nova foto", "Remover foto" when photo exists', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" avatarUrl="abc123" onUpload={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /alterar foto do paciente/i }))
    const menu = screen.getByRole('menu', { name: /Selecionar origem da foto/i })
    expect(within(menu).getByRole('menuitem', { name: /Trocar foto/i })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: /Tirar nova foto/i })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: /Remover foto/i })).toBeInTheDocument()
    // "Enviar imagem" and "Tirar foto" (no-photo labels) should NOT be shown
    expect(within(menu).queryByRole('menuitem', { name: /^Enviar imagem$/i })).not.toBeInTheDocument()
    expect(within(menu).queryByRole('menuitem', { name: /^Tirar foto$/i })).not.toBeInTheDocument()
  })
})

describe('PatientAvatarWidget — source picker interactions', () => {
  it('"Enviar imagem" triggers the gallery file input', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)

    const galleryInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
    expect(galleryInput).not.toBeNull()
    const gallerySpy = vi.spyOn(galleryInput, 'click')

    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Enviar imagem/i }))
    expect(gallerySpy).toHaveBeenCalledTimes(1)
  })

  it('"Tirar foto" opens the camera preview modal when getUserMedia is available', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Tirar foto/i }))

    // CameraPreviewModal should open (mocked)
    await waitFor(() => {
      expect(screen.getByTestId('camera-preview-modal')).toBeInTheDocument()
    })
  })

  it('capturing from camera preview opens the crop modal with the captured file', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Tirar foto/i }))

    await waitFor(() => screen.getByTestId('camera-preview-modal'))
    // Simulate capture
    await user.click(screen.getByRole('button', { name: /Capturar foto/i }))

    // Camera preview closes and crop modal opens
    await waitFor(() => {
      expect(screen.queryByTestId('camera-preview-modal')).not.toBeInTheDocument()
      expect(screen.getByTestId('avatar-crop-modal')).toBeInTheDocument()
    })
  })

  it('cancelling camera preview closes it without opening the crop modal', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: /Tirar foto/i }))

    await waitFor(() => screen.getByTestId('camera-preview-modal'))
    await user.click(screen.getByRole('button', { name: /Cancelar câmera/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('camera-preview-modal')).not.toBeInTheDocument()
    })
    expect(screen.queryByTestId('avatar-crop-modal')).not.toBeInTheDocument()
  })

  it('closes the source picker when clicking outside', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    expect(screen.getByRole('menu', { name: /Selecionar origem da foto/i })).toBeInTheDocument()
    const backdrop = document.querySelector('.fixed.inset-0.z-40') as HTMLElement
    fireEvent.click(backdrop)
    expect(screen.queryByRole('menu', { name: /Selecionar origem da foto/i })).not.toBeInTheDocument()
  })

  it('closes the source picker when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    expect(screen.getByRole('menu', { name: /Selecionar origem da foto/i })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('menu', { name: /Selecionar origem da foto/i })).not.toBeInTheDocument()
  })
})

// ── File validation ───────────────────────────────────────────────────────────

describe('PatientAvatarWidget — file validation', () => {
  it('calls onError when an invalid MIME type is selected', async () => {
    const onUpload = vi.fn()
    const onError = vi.fn()
    render(<PatientAvatarWidget name="Ana" onUpload={onUpload} onError={onError} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'video.mp4', { type: 'video/mp4' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.stringMatching(/formato inválido/i))
    })
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('calls onError when the file is too large', async () => {
    const onUpload = vi.fn()
    const onError = vi.fn()
    render(<PatientAvatarWidget name="Ana" onUpload={onUpload} onError={onError} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const blob = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: 'image/jpeg' })
    const file = new File([blob], 'big.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.stringMatching(/muito grande/i))
    })
    expect(onUpload).not.toHaveBeenCalled()
  })
})

// ── Crop modal integration ────────────────────────────────────────────────────

describe('PatientAvatarWidget — crop modal', () => {
  it('opens the crop modal when a valid file is selected via gallery input', async () => {
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByTestId('avatar-crop-modal')).toBeInTheDocument()
    })
  })

  it('does NOT call onUpload when crop is cancelled', async () => {
    const onUpload = vi.fn()
    render(<PatientAvatarWidget name="Ana" onUpload={onUpload} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } })

    await waitFor(() => screen.getByTestId('avatar-crop-modal'))
    fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('avatar-crop-modal')).not.toBeInTheDocument()
    })
    expect(onUpload).not.toHaveBeenCalled()
  })

  it('calls onUpload with the cropped base64 when crop is confirmed', async () => {
    const onUpload = vi.fn()
    render(<PatientAvatarWidget name="Ana" onUpload={onUpload} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } })

    await waitFor(() => screen.getByTestId('avatar-crop-modal'))
    fireEvent.click(screen.getByRole('button', { name: /Salvar foto/i }))

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith('CROPPED_BASE64')
    })
  })

  it('calls onUpload exactly once even if confirmed multiple times (modal closes)', async () => {
    const onUpload = vi.fn()
    render(<PatientAvatarWidget name="Ana" onUpload={onUpload} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } })

    await waitFor(() => screen.getByTestId('avatar-crop-modal'))
    fireEvent.click(screen.getByRole('button', { name: /Salvar foto/i }))

    await waitFor(() => {
      expect(screen.queryByTestId('avatar-crop-modal')).not.toBeInTheDocument()
    })
    expect(onUpload).toHaveBeenCalledTimes(1)
  })

  it('calls onError when crop export reports an error', async () => {
    const onError = vi.fn()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} onError={onError} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } })

    await waitFor(() => screen.getByTestId('avatar-crop-modal'))
    fireEvent.click(screen.getByRole('button', { name: /Trigger Error/i }))

    expect(onError).toHaveBeenCalledWith('canvas falhou')
  })
})

// ── Disabled / saving state ───────────────────────────────────────────────────

describe('PatientAvatarWidget — saving state', () => {
  it('disables the gallery file input when isSaving is true', () => {
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} isSaving />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it('does not render the upload button or any interactive picker when isSaving is true', () => {
    render(<PatientAvatarWidget name="Ana" avatarUrl="abc123" onUpload={vi.fn()} isSaving />)
    expect(screen.queryByRole('button', { name: /alterar foto/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('shows a spinner when isSaving is true', () => {
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} isSaving />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })
})

// ── Accessibility ─────────────────────────────────────────────────────────────

describe('PatientAvatarWidget — accessibility', () => {
  it('upload button has a meaningful aria-label when no photo', () => {
    render(<PatientAvatarWidget name="João" onUpload={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Adicionar foto do paciente' })).toBeInTheDocument()
  })

  it('upload button has a meaningful aria-label when photo exists', () => {
    render(<PatientAvatarWidget name="João" avatarUrl="x" onUpload={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Alterar foto do paciente' })).toBeInTheDocument()
  })

  it('"Remover foto" is accessible as a menuitem inside the picker when photo exists', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="João" avatarUrl="x" onUpload={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Alterar foto do paciente' }))
    expect(screen.getByRole('menuitem', { name: /Remover foto/i })).toBeInTheDocument()
  })
})
