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

  it('does not render a remove button when onUpload is absent', () => {
    render(<PatientAvatarWidget name="João Silva" avatarUrl="abc123" />)
    expect(
      screen.queryByRole('button', { name: /remover foto/i }),
    ).not.toBeInTheDocument()
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

  it('renders a remove button when a photo exists', () => {
    render(<PatientAvatarWidget name="Ana" avatarUrl="abc123" onUpload={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: /remover foto do paciente/i }),
    ).toBeInTheDocument()
  })

  it('does not render a remove button when there is no photo', () => {
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)
    expect(
      screen.queryByRole('button', { name: /remover foto/i }),
    ).not.toBeInTheDocument()
  })

  it('calls onUpload(null) when the remove button is clicked', async () => {
    const user = userEvent.setup()
    const onUpload = vi.fn()
    render(<PatientAvatarWidget name="Ana" avatarUrl="abc123" onUpload={onUpload} />)
    await user.click(screen.getByRole('button', { name: /remover foto do paciente/i }))
    expect(onUpload).toHaveBeenCalledWith(null)
  })
})

// ── Source picker ─────────────────────────────────────────────────────────────

describe('PatientAvatarWidget — source picker', () => {
  it('shows the source picker when the upload button is clicked', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    const menu = screen.getByRole('menu', { name: /Selecionar origem da foto/i })
    expect(within(menu).getByRole('menuitem', { name: /Enviar imagem/i })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: /Tirar foto/i })).toBeInTheDocument()
  })

  it('"Tirar foto" is always present in the picker — not hidden on desktop', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    const menu = screen.getByRole('menu', { name: /Selecionar origem da foto/i })
    const cameraBtn = within(menu).getByRole('menuitem', { name: /Tirar foto/i })
    expect(cameraBtn).toBeInTheDocument()
    expect(cameraBtn).not.toHaveClass('hidden')
    expect(cameraBtn).not.toHaveClass('sr-only')
  })

  it('"Enviar imagem" and "Tirar foto" target different hidden inputs', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)

    const inputs = document.querySelectorAll('input[type="file"]')
    expect(inputs.length).toBe(2)

    const galleryInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
    const cameraInput = document.querySelector('input[type="file"][capture]') as HTMLInputElement
    expect(galleryInput).not.toBeNull()
    expect(cameraInput).not.toBeNull()

    const gallerySpy = vi.spyOn(galleryInput, 'click')
    const cameraSpy = vi.spyOn(cameraInput, 'click')

    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    const menu1 = screen.getByRole('menu')
    await user.click(within(menu1).getByRole('menuitem', { name: /Enviar imagem/i }))
    expect(gallerySpy).toHaveBeenCalledTimes(1)
    expect(cameraSpy).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    const menu2 = screen.getByRole('menu')
    await user.click(within(menu2).getByRole('menuitem', { name: /Tirar foto/i }))
    expect(cameraSpy).toHaveBeenCalledTimes(1)
  })

  it('closes the source picker when clicking outside', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /adicionar foto do paciente/i }))
    expect(screen.getByRole('menu', { name: /Selecionar origem da foto/i })).toBeInTheDocument()
    // Click on the backdrop (fixed overlay)
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

    const fileInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
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

    const fileInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
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

    const fileInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByTestId('avatar-crop-modal')).toBeInTheDocument()
    })
  })

  it('opens the crop modal when a valid file is selected via camera input', async () => {
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)

    const cameraInput = document.querySelector('input[type="file"][capture]') as HTMLInputElement
    const file = new File(['data'], 'webcam.jpg', { type: 'image/jpeg' })
    fireEvent.change(cameraInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByTestId('avatar-crop-modal')).toBeInTheDocument()
    })
  })

  it('does NOT call onUpload when crop is cancelled', async () => {
    const onUpload = vi.fn()
    render(<PatientAvatarWidget name="Ana" onUpload={onUpload} />)

    const fileInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
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

    const fileInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
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

    const fileInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
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

    const fileInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
    fireEvent.change(fileInput, { target: { files: [new File(['x'], 'a.jpg', { type: 'image/jpeg' })] } })

    await waitFor(() => screen.getByTestId('avatar-crop-modal'))
    fireEvent.click(screen.getByRole('button', { name: /Trigger Error/i }))

    expect(onError).toHaveBeenCalledWith('canvas falhou')
  })
})

// ── Disabled / saving state ───────────────────────────────────────────────────

describe('PatientAvatarWidget — saving state', () => {
  it('disables both file inputs when isSaving is true', () => {
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} isSaving />)
    const inputs = document.querySelectorAll('input[type="file"]')
    inputs.forEach((input) => expect(input).toBeDisabled())
  })

  it('does not render the upload or remove buttons when isSaving is true', () => {
    render(<PatientAvatarWidget name="Ana" avatarUrl="abc123" onUpload={vi.fn()} isSaving />)
    expect(screen.queryByRole('button', { name: /alterar foto/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remover foto/i })).not.toBeInTheDocument()
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

  it('remove button has a meaningful aria-label', () => {
    render(<PatientAvatarWidget name="João" avatarUrl="x" onUpload={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Remover foto do paciente' })).toBeInTheDocument()
  })
})
