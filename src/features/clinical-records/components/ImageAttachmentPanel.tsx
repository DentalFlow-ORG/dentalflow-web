import { Camera, Image, Trash2, Upload, X, ZoomIn } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/date-time-formatters'
import { cn } from '@/lib/utils'

import {
  addAttachmentMetadata,
  listAttachments,
  removeAttachment,
  updateAttachmentDescription,
} from '../services/clinical-records.service'
import type { ClinicalRecordAttachment } from '../types/clinical-record.types'

// ── Constants ─────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_OUTPUT_DIMENSION = 1200
const MAX_THUMBNAIL_DIMENSION = 200
const JPEG_QUALITY = 0.82
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB original
const CAPTION_DEBOUNCE_MS = 800

// ── Mobile detection ──────────────────────────────────────────────────────────

// Returns true when the device is likely a phone or tablet with native camera
// capture support. We check both the user-agent (coarse) and a touch pointer
// media query (finer). Desktop browsers degrade capture="environment" to a
// plain file picker, which is misleading — we hide the camera button there.
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  const ua = navigator.userAgent
  if (/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return true
  return window.matchMedia('(pointer: coarse) and (hover: none)').matches
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number | null): string | null {
  if (bytes == null || bytes <= 0) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  recordId: string
  readOnly?: boolean
  /**
   * When false, the inner panel title is omitted.
   * Use this when the component is already inside a ClinicalSection
   * whose header communicates the section title, avoiding duplication.
   * The description text is always rendered regardless of this prop.
   * Defaults to true for backward compatibility.
   */
  showTitle?: boolean
}

// ── Main component ────────────────────────────────────────────────────────────

export function ImageAttachmentPanel({ recordId, readOnly = false, showTitle = true }: Props) {
  const { showAlert } = useGlobalAlerts()
  // inputRef — regular file picker
  // cameraInputRef — file picker with capture="environment" (opens native camera on mobile)
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Evaluated once on mount; stable for the component's lifetime because
  // the device type does not change while the page is open.
  const isMobile = useMemo(() => isMobileDevice(), [])

  const [attachments, setAttachments] = useState<ClinicalRecordAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [previewAttachment, setPreviewAttachment] = useState<ClinicalRecordAttachment | null>(null)

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)

    listAttachments(recordId)
      .then((data) => {
        if (isCurrent) setAttachments(data.filter((a) => a.dataBase64))
      })
      .catch(() => {
        if (isCurrent)
          showAlert({
            title: 'Erro',
            description: 'Não foi possível carregar as imagens.',
            tone: 'error',
          })
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [recordId, showAlert])

  // compressImage — unchanged from original implementation
  const compressImage = (
    file: File,
  ): Promise<{ dataBase64: string; thumbnailBase64: string; sizeBytes: number }> =>
    new Promise((resolve, reject) => {
      const img = new window.Image()
      const objectUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        const canvas = document.createElement('canvas')
        const thumb = document.createElement('canvas')

        const ratio = Math.min(
          MAX_OUTPUT_DIMENSION / img.width,
          MAX_OUTPUT_DIMENSION / img.height,
          1,
        )
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Não foi possível processar a imagem.'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        const tRatio = Math.min(
          MAX_THUMBNAIL_DIMENSION / img.width,
          MAX_THUMBNAIL_DIMENSION / img.height,
          1,
        )
        thumb.width = Math.round(img.width * tRatio)
        thumb.height = Math.round(img.height * tRatio)
        const tCtx = thumb.getContext('2d')
        if (!tCtx) {
          reject(new Error('Não foi possível processar a miniatura da imagem.'))
          return
        }
        tCtx.drawImage(img, 0, 0, thumb.width, thumb.height)

        const dataBase64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]
        const thumbnailBase64 = thumb.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]
        const sizeBytes = Math.round((dataBase64.length * 3) / 4)

        resolve({ dataBase64, thumbnailBase64, sizeBytes })
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Não foi possível ler a imagem.'))
      }
      img.src = objectUrl
    })

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      e.currentTarget.value = ''
      return
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      showAlert({
        title: 'Formato inválido',
        description: 'Envie apenas imagens JPEG, PNG ou WebP.',
        tone: 'error',
      })
      e.currentTarget.value = ''
      return
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      showAlert({
        title: 'Imagem muito grande',
        description: 'O tamanho máximo permitido é 5 MB.',
        tone: 'error',
      })
      e.currentTarget.value = ''
      return
    }

    setIsUploading(true)
    try {
      const { dataBase64, thumbnailBase64, sizeBytes } = await compressImage(file)
      const created = await addAttachmentMetadata(recordId, {
        fileName: file.name,
        fileType: file.type,
        mimeType: file.type,
        sizeBytes,
        dataBase64,
        thumbnailBase64,
      })
      setAttachments((prev) => [...prev, created])
      showAlert({
        title: 'Imagem adicionada.',
        description: 'A imagem foi salva no prontuário.',
        tone: 'success',
      })
    } catch {
      showAlert({
        title: 'Erro ao enviar',
        description: 'Não foi possível salvar a imagem. Tente novamente.',
        tone: 'error',
      })
    } finally {
      setIsUploading(false)
      // Reset both inputs to allow re-selecting the same file
      if (inputRef.current) inputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const handleRemove = async (attachmentId: string) => {
    try {
      await removeAttachment(recordId, attachmentId)
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      showAlert({
        title: 'Imagem removida.',
        description: 'A imagem foi removida do prontuário.',
        tone: 'info',
      })
    } catch {
      showAlert({ title: 'Erro', description: 'Não foi possível remover a imagem.', tone: 'error' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Carregando imagens...
      </div>
    )
  }

  return (
    <>
      {/* Hidden file inputs — rendered once, shared by all upload/camera buttons */}
      {!readOnly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          {/* capture="environment" opens the rear camera on mobile; only rendered on
              mobile devices where capture is natively supported. On desktop this input
              would silently degrade to a plain file picker, which is misleading.
              accept="image/*" is intentionally broader here — camera-captured images
              may arrive in device-native formats (HEIC, etc.) that would be rejected
              by specific MIME types. The format validation in handleFileSelect still
              enforces the allowed types after the file is selected. */}
          {isMobile && (
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          )}
        </>
      )}

      <div className="space-y-4">
        {/* Section header */}
        <div>
          {showTitle && (
            <p className="text-sm font-medium text-foreground">Imagens e anexos clínicos</p>
          )}
          <p className={cn('text-xs text-muted-foreground', showTitle && 'mt-0.5')}>
            {readOnly
              ? 'As imagens clínicas estão disponíveis apenas para consulta neste status do prontuário.'
              : 'Radiografias, fotos intraorais e extraorais do atendimento. As imagens são otimizadas antes de salvar.'}
          </p>
        </div>

        {/* Upload controls — shown above the grid when there are already attachments */}
        {!readOnly && attachments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              title="Selecionar imagem da galeria ou arquivos salvos"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Enviando...' : 'Enviar imagem'}
            </Button>
            {isMobile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                title="Abrir câmera do dispositivo"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4" />
                Tirar foto
              </Button>
            )}
            <span className="text-xs text-muted-foreground/60">JPEG, PNG ou WebP · máx. 5 MB</span>
          </div>
        )}

        {/* Empty state */}
        {attachments.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Image className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Nenhuma imagem adicionada</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                {readOnly
                  ? 'Este prontuário não possui imagens clínicas.'
                  : 'Adicione radiografias, fotos intraorais, extraorais ou registros relacionados ao atendimento.'}
              </p>
            </div>
            {!readOnly && (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  title="Selecionar imagem da galeria ou arquivos salvos"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4" />
                  {isUploading ? 'Enviando...' : 'Enviar imagem'}
                </Button>
                {isMobile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    title="Abrir câmera do dispositivo"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Camera className="h-4 w-4" />
                    Tirar foto
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Attachment grid — 1 col mobile, 2 sm, 3 lg */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {attachments.map((att) => (
              <AttachmentCard
                key={att.id}
                attachment={att}
                recordId={recordId}
                readOnly={readOnly}
                onPreview={att.dataBase64 ? () => setPreviewAttachment(att) : undefined}
                onRemove={readOnly ? undefined : () => setConfirmDeleteId(att.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Delete confirmation ──────────────────────────────────────────── */}
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Remover imagem"
        description="A imagem será removida permanentemente do prontuário."
        subject={attachments.find((a) => a.id === confirmDeleteId)?.fileName}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        tone="destructive"
        isConfirming={false}
        onConfirm={() => {
          if (confirmDeleteId) void handleRemove(confirmDeleteId)
          setConfirmDeleteId(null)
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* ── Lightbox / full-size preview ────────────────────────────────── */}
      {previewAttachment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualização de imagem"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewAttachment(null)}
        >
          {/* Stop click propagation so clicking the image doesn't close the lightbox */}
          <div
            className="flex max-h-full max-w-3xl flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="truncate text-sm text-white/80">{previewAttachment.fileName}</p>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Fechar visualização"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {previewAttachment.dataBase64 ? (
              <img
                src={`data:${previewAttachment.mimeType ?? 'image/jpeg'};base64,${previewAttachment.dataBase64}`}
                alt={previewAttachment.fileName}
                className="max-h-[80vh] max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-muted">
                <Image className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── AttachmentCard ─────────────────────────────────────────────────────────────

function AttachmentCard({
  attachment,
  recordId,
  readOnly,
  onPreview,
  onRemove,
}: {
  attachment: ClinicalRecordAttachment
  recordId: string
  readOnly: boolean
  onPreview?: () => void
  onRemove?: () => void
}) {
  const [description, setDescription] = useState(attachment.description ?? '')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // Caption debounce — logic unchanged from original implementation
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (readOnly) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSaveState('saving')
      try {
        await updateAttachmentDescription(recordId, attachment.id, description)
        setSaveState('saved')
        setTimeout(() => setSaveState('idle'), 1500)
      } catch {
        setSaveState('idle')
      }
    }, CAPTION_DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [description, readOnly, recordId, attachment.id])

  const src = attachment.thumbnailBase64
    ? `data:${attachment.mimeType ?? 'image/jpeg'};base64,${attachment.thumbnailBase64}`
    : attachment.dataBase64
      ? `data:${attachment.mimeType ?? 'image/jpeg'};base64,${attachment.dataBase64}`
      : null

  const meta = [
    formatDateBR(attachment.createdAt.slice(0, 10)),
    formatFileSize(attachment.sizeBytes),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Image area — clickable when preview is available */}
      <div className="group relative">
        {src ? (
          <>
            <img
              src={src}
              alt={attachment.fileName}
              className="aspect-square w-full object-cover"
            />
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                aria-label={`Ver imagem em tela cheia: ${attachment.fileName}`}
                className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30 focus-visible:bg-black/30 focus-visible:outline-none"
              >
                <ZoomIn
                  className="h-6 w-6 text-white opacity-0 drop-shadow transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                />
              </button>
            )}
          </>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-muted">
            <Image className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Metadata and actions */}
      <div className="space-y-2 p-3">
        {/* File name */}
        <p className="truncate text-xs font-medium text-foreground" title={attachment.fileName}>
          {attachment.fileName}
        </p>

        {/* Date and size */}
        {meta && <p className="text-[11px] text-muted-foreground/60">{meta}</p>}

        {/* Caption */}
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
            Legenda
          </p>
          <input
            type="text"
            placeholder={readOnly ? '—' : 'Adicionar legenda...'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded border-0 bg-transparent p-0 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            readOnly={readOnly}
          />
          {!readOnly && saveState === 'saving' && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">Salvando...</p>
          )}
          {!readOnly && saveState === 'saved' && (
            <p className="mt-0.5 text-[10px] text-emerald-500">Salvo</p>
          )}
        </div>

        {/* Remove action — always visible (not hover-only), accessible on mobile */}
        {onRemove && (
          <div className="flex justify-end border-t border-border pt-2">
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-[11px] text-red-500 transition-colors hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remover
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
