import { fireEvent, render, screen, waitFor } from '@/test-utils/render-utils'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import { ImageAttachmentPanel } from '@/features/clinical-records/components/ImageAttachmentPanel'

// ── Service / context mocks ───────────────────────────────────────────────────

const mockShowAlert = vi.fn()
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert: mockShowAlert }),
}))

vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  listAttachments: vi.fn().mockResolvedValue([]),
  addAttachmentMetadata: vi.fn(),
  removeAttachment: vi.fn(),
  updateAttachmentDescription: vi.fn(),
}))

// ConfirmDialog uses a Radix portal — render inline to stay in the jsdom tree.
vi.mock('@/components/common/ConfirmDialog', () => ({
  ConfirmDialog: () => null,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderPanel(props: Partial<{ readOnly: boolean }> = {}) {
  return render(
    <ImageAttachmentPanel recordId="rec-1" readOnly={props.readOnly ?? false} />,
  )
}

function makeFile(name: string, type: string, sizeBytes: number): File {
  const blob = new Blob([new Uint8Array(sizeBytes)], { type })
  return new File([blob], name, { type })
}

// ── Desktop baseline (default jsdom UA — not mobile) ─────────────────────────

describe('ImageAttachmentPanel — desktop (non-mobile device)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure matchMedia does not throw in jsdom
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    })
  })

  it('renders the "Enviar imagem" button in the empty state', async () => {
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enviar imagem/i })).toBeInTheDocument(),
    )
  })

  it('does NOT render the "Tirar foto" button on desktop', async () => {
    renderPanel()
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Tirar foto/i })).not.toBeInTheDocument(),
    )
  })

  it('the file input does not have a capture attribute (desktop — plain file picker)', async () => {
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enviar imagem/i })).toBeInTheDocument(),
    )
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).not.toBeNull()
    expect(fileInput).not.toHaveAttribute('capture')
  })

  it('clicking "Enviar imagem" triggers the hidden file input', async () => {
    const user = userEvent.setup()
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enviar imagem/i })).toBeInTheDocument(),
    )
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(fileInput, 'click')
    await user.click(screen.getByRole('button', { name: /Enviar imagem/i }))
    expect(clickSpy).toHaveBeenCalled()
  })

  it('shows an error alert when a non-image file type is selected', async () => {
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enviar imagem/i })).toBeInTheDocument(),
    )
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = makeFile('document.pdf', 'application/pdf', 1024)
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'error' }),
      ),
    )
  })

  it('shows an error alert when the selected file exceeds 5 MB', async () => {
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enviar imagem/i })).toBeInTheDocument(),
    )
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = makeFile('big.jpg', 'image/jpeg', 6 * 1024 * 1024)
    fireEvent.change(fileInput, { target: { files: [file] } })
    await waitFor(() =>
      expect(mockShowAlert).toHaveBeenCalledWith(
        expect.objectContaining({ tone: 'error' }),
      ),
    )
  })

  it('renders no buttons in readOnly mode', async () => {
    renderPanel({ readOnly: true })
    await waitFor(() =>
      // The read-only description text confirms the component loaded
      expect(
        screen.getByText(/disponíveis apenas para consulta/i),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: /Enviar imagem/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Tirar foto/i })).not.toBeInTheDocument()
  })
})

// ── Mobile device ─────────────────────────────────────────────────────────────

describe('ImageAttachmentPanel — mobile device', () => {
  const originalUserAgent = navigator.userAgent

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148',
      configurable: true,
    })
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    })
  })

  it('renders both "Enviar imagem" and "Tirar foto" buttons on mobile', async () => {
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enviar imagem/i })).toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: /Tirar foto/i })).toBeInTheDocument()
  })

  it('the camera input has capture="environment" on mobile', async () => {
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Tirar foto/i })).toBeInTheDocument(),
    )
    const cameraInput = document.querySelector('input[capture="environment"]') as HTMLInputElement
    expect(cameraInput).not.toBeNull()
    expect(cameraInput).toHaveAttribute('capture', 'environment')
  })

  it('the regular file input does NOT have a capture attribute on mobile', async () => {
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enviar imagem/i })).toBeInTheDocument(),
    )
    // There should be exactly two file inputs on mobile; the one without capture is the regular one.
    const fileInputs = document.querySelectorAll('input[type="file"]')
    expect(fileInputs.length).toBe(2)
    const regularInput = Array.from(fileInputs).find((el) => !el.hasAttribute('capture'))
    expect(regularInput).toBeTruthy()
  })

  it('clicking "Tirar foto" triggers the camera input, not the regular file input', async () => {
    const user = userEvent.setup()
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Tirar foto/i })).toBeInTheDocument(),
    )
    const cameraInput = document.querySelector('input[capture="environment"]') as HTMLInputElement
    const regularInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
    const cameraSpy = vi.spyOn(cameraInput, 'click')
    const regularSpy = vi.spyOn(regularInput, 'click')

    await user.click(screen.getByRole('button', { name: /Tirar foto/i }))

    expect(cameraSpy).toHaveBeenCalled()
    expect(regularSpy).not.toHaveBeenCalled()
  })

  it('clicking "Enviar imagem" triggers the regular file input, not the camera input', async () => {
    const user = userEvent.setup()
    renderPanel()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Enviar imagem/i })).toBeInTheDocument(),
    )
    const cameraInput = document.querySelector('input[capture="environment"]') as HTMLInputElement
    const regularInput = document.querySelector('input[type="file"]:not([capture])') as HTMLInputElement
    const cameraSpy = vi.spyOn(cameraInput, 'click')
    const regularSpy = vi.spyOn(regularInput, 'click')

    await user.click(screen.getByRole('button', { name: /Enviar imagem/i }))

    expect(regularSpy).toHaveBeenCalled()
    expect(cameraSpy).not.toHaveBeenCalled()
  })
})
