import { useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { JPEG_QUALITY, MAX_AVATAR_DIMENSION } from '@/lib/compress-avatar'
import {
  clampCropOffset,
  computeBaseScale,
  computeCropExportRect,
} from '@/lib/avatar-crop-math'

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
  // Tracks whether the image has finished loading and naturalSize is reliable.
  // Until true the image is rendered invisible to prevent showing a distorted
  // version while naturalSize is still at the {1,1} placeholder.
  const [naturalLoaded, setNaturalLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Create and revoke the object URL for the selected file.
  useEffect(() => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    setNaturalSize({ w: 1, h: 1 })
    setNaturalLoaded(false)
    setImageSrc(url)
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    return () => {
      URL.revokeObjectURL(url)
      setImageSrc(null)
      setNaturalLoaded(false)
    }
  }, [imageFile])

  // Derived render values ─────────────────────────────────────────────────────

  const baseScale = computeBaseScale(naturalSize.w, naturalSize.h, CROP_SIZE)
  const effectiveScale = baseScale * zoom
  const displayW = naturalSize.w * effectiveScale
  const displayH = naturalSize.h * effectiveScale

  const { clampedOx, clampedOy } = clampCropOffset(
    offset.x,
    offset.y,
    displayW,
    displayH,
    CROP_SIZE,
  )

  const imageLeft = (CROP_SIZE - displayW) / 2 + clampedOx
  const imageTop  = (CROP_SIZE - displayH) / 2 + clampedOy

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

  const zoomIn  = () => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 10) / 10))
  const zoomOut = () => setZoom((z) => Math.max(1, Math.round((z - 0.1) * 10) / 10))

  // ── Export ─────────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    const img = imgRef.current
    if (!img) return

    const out = MAX_AVATAR_DIMENSION
    const canvas = document.createElement('canvas')
    canvas.width  = out
    canvas.height = out
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onError?.('Não foi possível processar a imagem. Tente novamente.')
      onCancel()
      return
    }

    // Map the visible circular crop area back to source image coordinates.
    // Uses the same clampedOx/clampedOy that drove the render so the saved
    // result is pixel-accurate to what the user saw in the preview.
    const { srcX, srcY, srcSize } = computeCropExportRect({
      naturalW: naturalSize.w,
      naturalH: naturalSize.h,
      cropSize: CROP_SIZE,
      effectiveScale,
      clampedOx,
      clampedOy,
    })

    ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, out, out)
    const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]
    onConfirm(base64)
  }

  const title = patientName ? `Ajustar foto de ${patientName}` : 'Ajustar foto do paciente'

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
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
            <Dialog.Description className="mt-0.5 text-xs text-muted-foreground">
              Arraste para centralizar o rosto · use + / − para ajustar o zoom.
            </Dialog.Description>
          </div>

          {/* Crop area */}
          <div className="flex flex-col items-center gap-5 px-5 py-6">
            <div
              className="relative overflow-hidden bg-card select-none"
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
                    const el = e.currentTarget
                    setNaturalSize({ w: el.naturalWidth || 1, h: el.naturalHeight || 1 })
                    setNaturalLoaded(true)
                  }}
                  style={{
                    position: 'absolute',
                    width: displayW,
                    height: displayH,
                    left: imageLeft,
                    top: imageTop,
                    // Keep the element in the DOM for imgRef / onLoad, but
                    // invisible until naturalSize is known to prevent the brief
                    // distorted frame caused by the {w:1, h:1} placeholder.
                    opacity: naturalLoaded ? 1 : 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  }}
                />
              )}

              {/* Dimming overlay: transparent inside the crop circle, dark outside */}
              <div
                className="pointer-events-none absolute inset-0"
                data-testid="crop-circle-overlay"
                aria-hidden="true"
                style={{
                  background: `radial-gradient(circle ${CROP_SIZE / 2 - 1}px at 50% 50%, transparent 100%, rgba(0,0,0,0.55) 100%)`,
                }}
              />
              {/* Visible ring marking the exact crop boundary */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/50"
                aria-hidden="true"
              />
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
