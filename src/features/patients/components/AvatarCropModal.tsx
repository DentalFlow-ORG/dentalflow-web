import { useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { JPEG_QUALITY, MAX_AVATAR_DIMENSION } from '@/lib/compress-avatar'

// Display size of the circular crop area in px
const CROP_SIZE = 240

// ── Types ─────────────────────────────────────────────────────────────────────

type Offset = { x: number; y: number }

type Props = {
  open: boolean
  /** The raw File to crop. The modal manages the object-URL lifecycle. */
  imageFile: File | null
  patientName?: string
  onCancel: () => void
  onConfirm: (base64: string) => void
  /** Called when canvas export fails (e.g. unsupported browser). */
  onError?: (message: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AvatarCropModal({
  open,
  imageFile,
  patientName,
  onCancel,
  onConfirm,
  onError,
}: Props) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 })
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Create and revoke the object URL for the selected file.
  // naturalSize is reset first so the preview uses correct cover-fit from the
  // first frame, even before the new image fires its onLoad event.
  useEffect(() => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    setNaturalSize({ w: 1, h: 1 })
    setImageSrc(url)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    return () => {
      URL.revokeObjectURL(url)
      setImageSrc(null)
    }
  }, [imageFile])

  // Cover-fit: scale so the image fills the crop circle (larger dimension wins)
  const initialScale = Math.max(
    CROP_SIZE / Math.max(naturalSize.w, 1),
    CROP_SIZE / Math.max(naturalSize.h, 1),
  )
  const effectiveScale = initialScale * zoom
  const displayW = naturalSize.w * effectiveScale
  const displayH = naturalSize.h * effectiveScale

  // Clamp offset so image always covers the full crop area
  const maxOx = Math.max(0, (displayW - CROP_SIZE) / 2)
  const maxOy = Math.max(0, (displayH - CROP_SIZE) / 2)
  const clampedOx = Math.max(-maxOx, Math.min(maxOx, offset.x))
  const clampedOy = Math.max(-maxOy, Math.min(maxOy, offset.y))

  const imageLeft = (CROP_SIZE - displayW) / 2 + clampedOx
  const imageTop = (CROP_SIZE - displayH) / 2 + clampedOy

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStart.current = { x: e.clientX, y: e.clientY, ox: clampedOx, oy: clampedOy }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    dragStart.current = null
  }

  // ── Zoom ───────────────────────────────────────────────────────────────────

  const zoomIn = () =>
    setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))
  const zoomOut = () =>
    setZoom((z) => Math.max(1, Math.round((z - 0.1) * 10) / 10))

  // ── Export ─────────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    const img = imgRef.current
    if (!img) return

    const out = MAX_AVATAR_DIMENSION
    const canvas = document.createElement('canvas')
    canvas.width = out
    canvas.height = out
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onError?.('Não foi possível processar a imagem. Tente novamente.')
      onCancel()
      return
    }

    // Map the crop area back to image source coordinates
    const srcX = -imageLeft / effectiveScale
    const srcY = -imageTop / effectiveScale
    const srcW = CROP_SIZE / effectiveScale
    const srcH = CROP_SIZE / effectiveScale

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, out, out)
    const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]
    onConfirm(base64)
  }

  const title = patientName ? `Ajustar foto de ${patientName}` : 'Ajustar foto do paciente'

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          aria-describedby="crop-modal-desc"
          className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            onCancel()
          }}
          onInteractOutside={onCancel}
        >
          {/* Header */}
          <div className="border-b border-border px-5 py-4">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {title}
            </Dialog.Title>
            <p id="crop-modal-desc" className="mt-0.5 text-xs text-muted-foreground">
              Arraste para posicionar · use + / − para ajustar o zoom.
            </p>
          </div>

          {/* Crop area */}
          <div className="flex flex-col items-center gap-5 px-5 py-6">
            <div
              className="relative overflow-hidden rounded-full bg-muted ring-2 ring-primary/30 select-none"
              style={{
                width: CROP_SIZE,
                height: CROP_SIZE,
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              role="presentation"
              aria-label="Área de recorte circular — arraste para posicionar"
            >
              {imageSrc && (
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  onLoad={(e) => {
                    const img = e.currentTarget
                    setNaturalSize({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 })
                  }}
                  style={{
                    position: 'absolute',
                    width: displayW,
                    height: displayH,
                    left: imageLeft,
                    top: imageTop,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                />
              )}
            </div>

            {/* Zoom controls */}
            <div className="flex items-center gap-3" role="group" aria-label="Controles de zoom">
              <button
                type="button"
                aria-label="Reduzir zoom"
                onClick={zoomOut}
                disabled={zoom <= 1}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border border-border',
                  'text-foreground transition-colors hover:bg-muted',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                )}
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>

              <span
                aria-live="polite"
                aria-label={`Zoom: ${(zoom * 100).toFixed(0)}%`}
                className="min-w-[3.5rem] text-center text-sm tabular-nums text-muted-foreground"
              >
                {(zoom * 100).toFixed(0)}%
              </span>

              <button
                type="button"
                aria-label="Aumentar zoom"
                onClick={zoomIn}
                disabled={zoom >= 3}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border border-border',
                  'text-foreground transition-colors hover:bg-muted',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
                  'disabled:cursor-not-allowed disabled:opacity-40',
                )}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Salvar foto
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
