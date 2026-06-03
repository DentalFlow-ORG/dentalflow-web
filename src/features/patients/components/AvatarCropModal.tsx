import { useEffect, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { Button } from '@/components/ui/button'
import { JPEG_QUALITY, MAX_AVATAR_DIMENSION } from '@/lib/compress-avatar'
import {
  clampCropPosition,
  computeCropExportTransform,
  computeInitialImageTransform,
  getCropStageLayout,
  rotateLeft,
  type Point,
  type RotationDegrees,
} from '@/lib/avatar-crop-math'
import { cn } from '@/lib/utils'

const STAGE_WIDTH = 448
const STAGE_HEIGHT = 360
const CROP_SIZE = 312
const CROP_INSET = 24

type Props = {
  open: boolean
  imageFile: File | null
  patientName?: string
  onCancel: () => void
  onConfirm: (base64: string) => void
  onError?: (message: string) => void
}

export function AvatarCropModal({
  open,
  imageFile,
  patientName,
  onCancel,
  onConfirm,
  onError,
}: Props) {
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [rotation, setRotation] = useState<RotationDegrees>(0)
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 })
  const [naturalLoaded, setNaturalLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const stageShellRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const isDraggingRef = useRef(false)
  const rafId = useRef<number | null>(null)
  const pendingPointer = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    setNaturalSize({ w: 1, h: 1 })
    setNaturalLoaded(false)
    setImageSrc(url)
    setOffset({ x: 0, y: 0 })
    setRotation(0)

    return () => {
      URL.revokeObjectURL(url)
      setImageSrc(null)
      setNaturalLoaded(false)
    }
  }, [imageFile])

  const [stageWidth, setStageWidth] = useState(STAGE_WIDTH)

  useEffect(() => {
    const shell = stageShellRef.current
    if (!shell || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = Math.min(STAGE_WIDTH, Math.max(1, entry.contentRect.width))
      setStageWidth(nextWidth)
    })
    observer.observe(shell)

    return () => observer.disconnect()
  }, [])

  const layout = getCropStageLayout({
    stageWidth,
    stageHeight: STAGE_HEIGHT,
    cropSize: Math.min(CROP_SIZE, stageWidth),
  })
  const circleSize = Math.max(1, layout.cropSize - CROP_INSET)
  const circleOffset = (layout.cropSize - circleSize) / 2

  const imageTransform = computeInitialImageTransform({
    naturalW: naturalSize.w,
    naturalH: naturalSize.h,
    rotation,
    cropSize: layout.cropSize,
    offset,
  })

  const cropCenterX = layout.stageWidth / 2
  const cropCenterY = layout.stageHeight / 2
  const imageCenterX = cropCenterX + imageTransform.offset.x
  const imageCenterY = cropCenterY + imageTransform.offset.y

  const stopDrag = () => {
    isDraggingRef.current = false
    setIsDragging(false)
    dragStart.current = null
    pendingPointer.current = null
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId)
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
    isDraggingRef.current = true
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: imageTransform.offset.x,
      oy: imageTransform.offset.y,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !dragStart.current) return
    pendingPointer.current = { x: e.clientX, y: e.clientY }

    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null
        const ds = dragStart.current
        const pp = pendingPointer.current
        if (!isDraggingRef.current || !ds || !pp) return

        const nextOffset = {
          x: ds.ox + (pp.x - ds.x),
          y: ds.oy + (pp.y - ds.y),
        }
        setOffset(
          clampCropPosition(
            nextOffset,
            imageTransform.rotatedWidth,
            imageTransform.rotatedHeight,
            layout.cropSize,
          ),
        )
      })
    }
  }

  const handleRotateLeft = () => {
    const nextRotation = rotateLeft(rotation)
    const nextTransform = computeInitialImageTransform({
      naturalW: naturalSize.w,
      naturalH: naturalSize.h,
      rotation: nextRotation,
      cropSize: layout.cropSize,
      offset,
    })
    setRotation(nextRotation)
    setOffset(nextTransform.offset)
  }

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

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, out, out)

    const exportTransform = computeCropExportTransform({
      naturalW: naturalSize.w,
      naturalH: naturalSize.h,
      rotation,
      scale: imageTransform.scale,
      offset: imageTransform.offset,
      cropSize: layout.cropSize,
      outputSize: out,
    })

    ctx.save()
    ctx.translate(exportTransform.translateX, exportTransform.translateY)
    ctx.rotate(exportTransform.rotationRadians)
    ctx.drawImage(
      img,
      -exportTransform.drawWidth / 2,
      -exportTransform.drawHeight / 2,
      exportTransform.drawWidth,
      exportTransform.drawHeight,
    )
    ctx.restore()

    const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]
    onConfirm(base64)
  }

  const title = patientName ? `Ajustar foto de ${patientName}` : 'Ajustar foto do paciente'

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[70] w-[94vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            onCancel()
          }}
          onInteractOutside={onCancel}
        >
          <div className="border-b border-border px-6 py-5">
            <Dialog.Title className="text-base font-semibold text-foreground">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Arraste para enquadrar a foto. Use girar para ajustar a orientação.
            </Dialog.Description>
          </div>

          <div className="flex flex-col items-center gap-4 px-5 py-6">
            <div ref={stageShellRef} className="w-full max-w-[448px]">
              <div
                className={cn(
                  'relative overflow-hidden rounded-[22px] border border-border bg-muted select-none',
                  'shadow-inner',
                )}
                data-testid="avatar-crop-stage"
                style={{
                  width: layout.stageWidth,
                  height: layout.stageHeight,
                  maxWidth: '100%',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none',
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDrag}
                onPointerCancel={stopDrag}
                role="presentation"
                aria-label="Área de recorte quadrada. Arraste para enquadrar a foto."
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
                    setOffset({ x: 0, y: 0 })
                  }}
                  data-testid="avatar-crop-image"
                  style={{
                    position: 'absolute',
                    width: imageTransform.displayWidth,
                    height: imageTransform.displayHeight,
                    left: imageCenterX,
                    top: imageCenterY,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    opacity: naturalLoaded ? 1 : 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    maxWidth: 'none',
                  }}
                />
              )}

              <div
                className="pointer-events-none absolute border border-white/60 shadow-[0_0_0_999px_rgba(15,23,42,0.34)] ring-1 ring-primary/30"
                data-testid="crop-square-frame"
                aria-hidden="true"
                style={{
                  width: layout.cropSize,
                  height: layout.cropSize,
                  left: layout.cropLeft,
                  top: layout.cropTop,
                }}
              />

              <div
                className="pointer-events-none absolute"
                data-testid="crop-circle-overlay"
                aria-hidden="true"
                style={{
                  width: layout.cropSize,
                  height: layout.cropSize,
                  left: layout.cropLeft,
                  top: layout.cropTop,
                  background: `radial-gradient(circle ${circleSize / 2}px at 50% 50%, transparent 99%, rgba(15,23,42,0.22) 100%)`,
                }}
              />

              <div
                className="pointer-events-none absolute rounded-full ring-2 ring-white/80 shadow-[0_0_0_1px_rgba(30,58,138,0.25)]"
                data-testid="crop-circle-ring"
                aria-hidden="true"
                style={{
                  width: circleSize,
                  height: circleSize,
                  left: layout.cropLeft + circleOffset,
                  top: layout.cropTop + circleOffset,
                }}
              />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRotateLeft}
              aria-label="Girar para esquerda"
              className="gap-2 rounded-full"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Girar para esquerda
            </Button>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-5 sm:flex-row sm:justify-end">
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
