import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'
import {
  PatientAvatarWidget,
  getAvatarInitials,
} from '@/features/patients/components/PatientAvatarWidget'

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
    // Initials are inside an aria-hidden div, so we look by text content
    expect(document.body.textContent).toContain('JS')
  })

  it('renders an img when avatarUrl is provided', () => {
    render(<PatientAvatarWidget name="Ana Luz" avatarUrl="abc123" />)
    // The img is inside an aria-hidden container (purely decorative), so query by DOM directly
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

  it('opens the file input when the upload button is clicked', async () => {
    const user = userEvent.setup()
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} />)
    const uploadButton = screen.getByRole('button', { name: /adicionar foto do paciente/i })
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(fileInput, 'click')
    await user.click(uploadButton)
    expect(clickSpy).toHaveBeenCalled()
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
    // 6 MB > 5 MB limit
    const blob = new Blob([new Uint8Array(6 * 1024 * 1024)], { type: 'image/jpeg' })
    const file = new File([blob], 'big.jpg', { type: 'image/jpeg' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(expect.stringMatching(/muito grande/i))
    })
    expect(onUpload).not.toHaveBeenCalled()
  })
})

// ── Disabled / saving state ───────────────────────────────────────────────────

describe('PatientAvatarWidget — saving state', () => {
  it('disables the file input when isSaving is true', () => {
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} isSaving />)
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeDisabled()
  })

  it('does not render the upload or remove buttons when isSaving is true', () => {
    render(<PatientAvatarWidget name="Ana" avatarUrl="abc123" onUpload={vi.fn()} isSaving />)
    expect(screen.queryByRole('button', { name: /alterar foto/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remover foto/i })).not.toBeInTheDocument()
  })

  it('shows a spinner when isSaving is true', () => {
    render(<PatientAvatarWidget name="Ana" onUpload={vi.fn()} isSaving />)
    // Loader2 renders as an SVG inside the overlay — check via role
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
