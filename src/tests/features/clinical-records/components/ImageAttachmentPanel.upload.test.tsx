import { ImageAttachmentPanel } from '@/features/clinical-records/components/ImageAttachmentPanel'
import {
  addAttachmentMetadata,
  listAttachments,
} from '@/features/clinical-records/services/clinical-records.service'
import { ApiError } from '@/services/http'
import { makeAttachment } from '@/test-utils/factories/attachment.factory'
import {
  act,
  fireEvent,
  renderWithProviders,
  screen,
  userEvent,
  waitFor,
} from '@/test-utils/render-utils'

const showAlert = vi.hoisted(() => vi.fn())
vi.mock('@/components/common/global-alerts-context', () => ({
  useGlobalAlerts: () => ({ showAlert }),
}))
vi.mock('@/features/clinical-records/services/clinical-records.service', () => ({
  listAttachments: vi.fn(),
  addAttachmentMetadata: vi.fn(),
  removeAttachment: vi.fn(),
  updateAttachmentDescription: vi.fn(),
}))

let image: { width: number; height: number; onload: () => void; onerror: () => void }
const drawImage = vi.fn()

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
  vi.stubGlobal(
    'Image',
    class {
      width = 2400
      height = 1200
      onload = () => {}
      onerror = () => {}
      constructor() {
        image = this
      }
    },
  )
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = vi.fn().mockReturnValue('blob:clinical-image')
      static revokeObjectURL = vi.fn()
    },
  )
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage,
  } as unknown as CanvasRenderingContext2D)
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
    'data:image/jpeg;base64,aW1hZ2U=',
  )
  vi.mocked(listAttachments).mockResolvedValue([])
  vi.mocked(addAttachmentMetadata).mockResolvedValue(makeAttachment())
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function selectImage(camera = false) {
  const view = renderWithProviders(<ImageAttachmentPanel recordId="record-1" />)
  await screen.findByRole('button', { name: 'Enviar imagem' })
  // These native inputs are deliberately visually hidden behind their action buttons.
  const selector = camera ? 'input[capture]' : 'input[type="file"]:not([capture])'
  const input = view.container.querySelector<HTMLInputElement>(selector)
  if (!input) throw new Error('Expected the native image input')
  fireEvent.change(input, {
    target: { files: [new File(['image'], 'radiografia.jpg', { type: 'image/jpeg' })] },
  })
  return input
}

it.each([false, true])('optimizes and uploads the selected image (camera=%s)', async (camera) => {
  const input = await selectImage(camera)
  expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Tirar foto' })).toBeDisabled()
  await act(async () => image.onload())
  expect(addAttachmentMetadata).toHaveBeenCalledExactlyOnceWith('record-1', {
    fileName: 'radiografia.jpg',
    fileType: 'image/jpeg',
    mimeType: 'image/jpeg',
    sizeBytes: 6,
    dataBase64: 'aW1hZ2U=',
    thumbnailBase64: 'aW1hZ2U=',
  })
  expect(drawImage).toHaveBeenNthCalledWith(1, image, 0, 0, 1200, 600)
  expect(drawImage).toHaveBeenNthCalledWith(2, image, 0, 0, 200, 100)
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:clinical-image')
  expect(await screen.findByRole('img', { name: 'radiografia.jpg' })).toBeInTheDocument()
  expect(input).toHaveValue('')
  expect(screen.getByRole('button', { name: 'Enviar imagem' })).toBeEnabled()
  expect(showAlert).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Imagem adicionada.', tone: 'success' }),
  )
})

it('does not upscale a small image and allows opening both pickers after upload', async () => {
  await selectImage()
  image.width = 100
  image.height = 50
  await act(async () => image.onload())
  expect(drawImage).toHaveBeenNthCalledWith(1, image, 0, 0, 100, 50)
  expect(drawImage).toHaveBeenNthCalledWith(2, image, 0, 0, 100, 50)
  const user = userEvent.setup()
  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]:not([capture])')
  const cameraInput = document.querySelector<HTMLInputElement>('input[capture]')
  if (!fileInput || !cameraInput) throw new Error('Expected both image inputs')
  const pickFile = vi.spyOn(fileInput, 'click')
  const pickCamera = vi.spyOn(cameraInput, 'click')
  await user.click(screen.getByRole('button', { name: 'Enviar imagem' }))
  await user.click(screen.getByRole('button', { name: 'Tirar foto' }))
  expect(pickFile).toHaveBeenCalledOnce()
  expect(pickCamera).toHaveBeenCalledOnce()
})

it.each(['decode', 'canvas', 'thumbnail', 'service'])(
  'recovers from a %s failure without retaining a phantom attachment',
  async (failure) => {
    if (failure === 'canvas')
      vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null)
    if (failure === 'thumbnail')
      vi.mocked(HTMLCanvasElement.prototype.getContext)
        .mockReturnValueOnce({ drawImage } as unknown as CanvasRenderingContext2D)
        .mockReturnValueOnce(null)
    if (failure === 'service')
      vi.mocked(addAttachmentMetadata).mockRejectedValueOnce(new Error('offline'))
    const input = await selectImage()
    await act(async () => (failure === 'decode' ? image.onerror() : image.onload()))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar imagem' })).toBeEnabled())
    expect(screen.getByText('Nenhuma imagem adicionada')).toBeInTheDocument()
    expect(input).toHaveValue('')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:clinical-image')
    expect(showAlert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Erro ao enviar', tone: 'error' }),
    )
    if (failure !== 'service') expect(addAttachmentMetadata).not.toHaveBeenCalled()
    // Selecting the same file again remains possible after the failure.
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D)
    fireEvent.change(input, {
      target: { files: [new File(['image'], 'radiografia.jpg', { type: 'image/jpeg' })] },
    })
    await act(async () => image.onload())
    expect(await screen.findByRole('img')).toBeInTheDocument()
  },
)

it('treats cancelling the file picker as a no-op', async () => {
  const view = renderWithProviders(<ImageAttachmentPanel recordId="record-1" />)
  await screen.findByRole('button', { name: 'Enviar imagem' })
  const input = view.container.querySelector<HTMLInputElement>('input[type="file"]')
  if (!input) throw new Error('Expected the native image input')
  fireEvent.change(input, { target: { files: [] } })
  expect(addAttachmentMetadata).not.toHaveBeenCalled()
  expect(showAlert).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Enviar imagem' })).toBeEnabled()
})

it('keeps existing images visible and prevents duplicate uploads while adding another image', async () => {
  vi.mocked(listAttachments).mockResolvedValue([
    makeAttachment({ id: 'existing', fileName: 'existente.jpg' }),
  ])
  vi.mocked(addAttachmentMetadata).mockResolvedValue(makeAttachment({ id: 'new' }))
  await selectImage()
  expect(screen.getByRole('img', { name: 'existente.jpg' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Tirar foto' })).toBeDisabled()
  await act(async () => image.onload())
  expect(screen.getByRole('img', { name: 'existente.jpg' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: 'radiografia.jpg' })).toBeInTheDocument()
  expect(addAttachmentMetadata).toHaveBeenCalledOnce()
  expect(screen.getByRole('button', { name: 'Enviar imagem' })).toBeEnabled()
})

it('shows returned attachment metadata without offering a broken image preview when image data is absent', async () => {
  vi.mocked(addAttachmentMetadata).mockResolvedValue(
    makeAttachment({ dataBase64: null, thumbnailBase64: null }),
  )
  await selectImage()
  await act(async () => image.onload())
  expect(screen.getByText('radiografia.jpg')).toBeInTheDocument()
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /Ver imagem em tela cheia/ })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Enviar imagem' })).toBeEnabled()
})

it('keeps mutation controls hidden if a record becomes read-only during an initiated upload', async () => {
  let resolve!: (value: ReturnType<typeof makeAttachment>) => void
  vi.mocked(addAttachmentMetadata).mockReturnValueOnce(
    new Promise((done) => {
      resolve = done
    }),
  )
  const view = renderWithProviders(<ImageAttachmentPanel recordId="record-1" />)
  await screen.findByRole('button', { name: 'Enviar imagem' })
  const input = view.container.querySelector('input[type="file"]')
  if (!input) throw new Error('Expected image input')
  fireEvent.change(input, {
    target: { files: [new File(['image'], 'radiografia.jpg', { type: 'image/jpeg' })] },
  })
  await act(async () => image.onload())
  view.rerender(<ImageAttachmentPanel recordId="record-1" readOnly />)
  await act(async () => resolve(makeAttachment()))
  expect(screen.getByRole('img', { name: 'radiografia.jpg' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Enviar imagem' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Remover' })).not.toBeInTheDocument()
  expect(screen.getByRole('textbox')).toHaveAttribute('readonly')
})

it('lowers JPEG quality and then size until the image fits the API base64 limit', async () => {
  // Large encodings for the first two sizes; the 800px encoding at quality 0.72 fits.
  vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockImplementation(function (
    this: HTMLCanvasElement,
    _type?: string,
    quality?: number,
  ) {
    const fits = this.width <= 800 && (quality ?? 1) <= 0.72
    return `data:image/jpeg;base64,${fits ? 'aW1hZ2U=' : 'a'.repeat(130_000)}`
  })
  await selectImage()
  await act(async () => image.onload())
  expect(addAttachmentMetadata).toHaveBeenCalledWith(
    'record-1',
    expect.objectContaining({ dataBase64: 'aW1hZ2U=', sizeBytes: 6 }),
  )
  expect(drawImage).toHaveBeenCalledWith(image, 0, 0, 800, 400)
})

it('explains when even the smallest legible encoding is too large, without uploading', async () => {
  vi.mocked(HTMLCanvasElement.prototype.toDataURL).mockReturnValue(
    `data:image/jpeg;base64,${'a'.repeat(130_000)}`,
  )
  await selectImage()
  await act(async () => image.onload())
  expect(addAttachmentMetadata).not.toHaveBeenCalled()
  expect(showAlert).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Erro ao enviar',
      description: expect.stringContaining('Não foi possível reduzir a imagem'),
    }),
  )
})

it('declares the re-encoded JPEG type and a safe .jpg name for PNG uploads', async () => {
  const view = renderWithProviders(<ImageAttachmentPanel recordId="record-1" />)
  await screen.findByRole('button', { name: 'Enviar imagem' })
  const input = view.container.querySelector<HTMLInputElement>('input[type="file"]:not([capture])')
  if (!input) throw new Error('Expected the native image input')
  fireEvent.change(input, {
    target: { files: [new File(['image'], `${'x'.repeat(300)}.png`, { type: 'image/png' })] },
  })
  await act(async () => image.onload())
  const payload = vi.mocked(addAttachmentMetadata).mock.calls[0][1]
  expect(payload).toMatchObject({ fileType: 'image/jpeg', mimeType: 'image/jpeg' })
  expect(payload.fileName).toHaveLength(180)
  expect(payload.fileName.endsWith('.jpg')).toBe(true)
})

it('shows the API message when the server rejects the image', async () => {
  vi.mocked(addAttachmentMetadata).mockRejectedValueOnce(
    new ApiError('Imagem deve ser enviada em formato base64 valido.', 400, null),
  )
  await selectImage()
  await act(async () => image.onload())
  expect(showAlert).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Erro ao enviar',
      description: 'Imagem deve ser enviada em formato base64 valido.',
    }),
  )
})

it('explains how to avoid HEIC photos instead of a generic format error', async () => {
  const view = renderWithProviders(<ImageAttachmentPanel recordId="record-1" />)
  await screen.findByRole('button', { name: 'Enviar imagem' })
  const input = view.container.querySelector<HTMLInputElement>('input[capture]')
  if (!input) throw new Error('Expected the camera input')
  fireEvent.change(input, {
    target: { files: [new File(['image'], 'IMG_0001.HEIC', { type: 'image/heic' })] },
  })
  expect(addAttachmentMetadata).not.toHaveBeenCalled()
  expect(showAlert).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Formato inválido',
      description: expect.stringContaining('Fotos HEIC não são aceitas'),
    }),
  )
})
