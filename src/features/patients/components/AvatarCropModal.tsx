import { RotateCcw } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  type CropResizeHandle,
  type Point,
  type RotationDegrees,
  clampCropPosition,
  clampCropSize,
  computeCenteredCropResize,
  computeCoverScale,
  computeCropExportTransform,
  computeInitialImageTransform,
  getCropStageLayout,
  rotateLeft,
} from '@/lib/avatar-crop-math'
import { JPEG_QUALITY, MAX_AVATAR_DIMENSION } from '@/lib/compress-avatar'
import { cn } from '@/lib/utils'

const STAGE_WIDTH = 560
const STAGE_HEIGHT = 500
const INITIAL_CROP_SIZE = 420
const MIN_CROP_SIZE = 180
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
  const [cropSize, setCropSize] = useState(INITIAL_CROP_SIZE)
  const [imageScale, setImageScale] = useState(1)
  const [rotation, setRotation] = useState<RotationDegrees>(0)
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 })
  const [naturalLoaded, setNaturalLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const stageShellRef = useRef<HTMLDivElement>(null)
  const activeInteraction = useRef<
    | { type: 'move'; x: number; y: number; ox: number; oy: number }
    | { type: 'resize'; x: number; y: number; cropSize: number; handle: CropResizeHandle }
    | null
  >(null)
  const rafId = useRef<number | null>(null)
  const pendingPointer = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    setNaturalSize({ w: 1, h: 1 })
    setNaturalLoaded(false)
    setImageSrc(url)
    setOffset({ x: 0, y: 0 })
    setCropSize(INITIAL_CROP_SIZE)
    setImageScale(1)
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

  const stageHeight = useMemo(
    () => Math.min(STAGE_HEIGHT, Math.max(360, stageWidth * 0.9)),
    [stageWidth],
  )
  const maxCropSize = useMemo(() => Math.min(stageWidth, stageHeight), [stageHeight, stageWidth])
  const clampedCropSize = useMemo(
    () => clampCropSize(cropSize, MIN_CROP_SIZE, maxCropSize),
    [cropSize, maxCropSize],
  )
  const layout = useMemo(
    () =>
      getCropStageLayout({
        stageWidth,
        stageHeight,
        cropSize: clampedCropSize,
      }),
    [clampedCropSize, stageHeight, stageWidth],
  )
  const circleSize = Math.max(1, layout.cropSize - CROP_INSET)
  const circleOffset = (layout.cropSize - circleSize) / 2

  const imageTransform = useMemo(
    () =>
      computeInitialImageTransform({
        naturalW: naturalSize.w,
        naturalH: naturalSize.h,
        rotation,
        cropSize: layout.cropSize,
        scale: imageScale,
        offset,
      }),
    [imageScale, layout.cropSize, naturalSize.h, naturalSize.w, offset, rotation],
  )

  useEffect(() => {
    if (cropSize === clampedCropSize) return
    setCropSize(clampedCropSize)
  }, [clampedCropSize, cropSize])

  useEffect(() => {
    const coverScale = computeCoverScale(naturalSize.w, naturalSize.h, rotation, layout.cropSize)
    setImageScale((current) => (current >= coverScale ? current : coverScale))
    setOffset((current) => {
      const next = clampCropPosition(
        current,
        imageTransform.rotatedWidth,
        imageTransform.rotatedHeight,
        layout.cropSize,
      )
      return next.x === current.x && next.y === current.y ? current : next
    })
  }, [
    imageTransform.rotatedHeight,
    imageTransform.rotatedWidth,
    layout.cropSize,
    naturalSize.h,
    naturalSize.w,
    rotation,
  ])

  const setOffsetIfChanged = useCallback((nextOffset: Point) => {
    setOffset((current) => {
      if (current.x === nextOffset.x && current.y === nextOffset.y) return current
      return nextOffset
    })
  }, [])

  const setCropSizeIfChanged = useCallback((nextCropSize: number) => {
    setCropSize((current) => (current === nextCropSize ? current : nextCropSize))
  }, [])

  const stopInteraction = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    activeInteraction.current = null
    pendingPointer.current = null
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current)
      rafId.current = null
    }
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture?.(e.pointerId)
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
      setIsDragging(true)
      activeInteraction.current = {
        type: 'move',
        x: e.clientX,
        y: e.clientY,
        ox: imageTransform.offset.x,
        oy: imageTransform.offset.y,
      }
    },
    [imageTransform.offset.x, imageTransform.offset.y],
  )

  const handleResizePointerDown = useCallback(
    (handle: CropResizeHandle, e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      e.currentTarget.setPointerCapture?.(e.pointerId)
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
        rafId.current = null
      }
      setIsResizing(true)
      activeInteraction.current = {
        type: 'resize',
        x: e.clientX,
        y: e.clientY,
        cropSize: layout.cropSize,
        handle,
      }
    },
    [layout.cropSize],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeInteraction.current) return
      pendingPointer.current = { x: e.clientX, y: e.clientY }

      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          rafId.current = null
          const interaction = activeInteraction.current
          const pp = pendingPointer.current
          if (!interaction || !pp) return

          if (interaction.type === 'move') {
            const nextOffset = {
              x: interaction.ox + (pp.x - interaction.x),
              y: interaction.oy + (pp.y - interaction.y),
            }
            setOffsetIfChanged(
              clampCropPosition(
                nextOffset,
                imageTransform.rotatedWidth,
                imageTransform.rotatedHeight,
                layout.cropSize,
              ),
            )
            return
          }

          const nextCropSize = computeCenteredCropResize({
            startSize: interaction.cropSize,
            deltaX: pp.x - interaction.x,
            deltaY: pp.y - interaction.y,
            handle: interaction.handle,
            minSize: MIN_CROP_SIZE,
            maxSize: maxCropSize,
          })
          setCropSizeIfChanged(nextCropSize)

          const nextScale = computeCoverScale(naturalSize.w, naturalSize.h, rotation, nextCropSize)
          setImageScale((current) => (current >= nextScale ? current : nextScale))
          setOffset((current) => {
            const nextTransform = computeInitialImageTransform({
              naturalW: naturalSize.w,
              naturalH: naturalSize.h,
              rotation,
              cropSize: nextCropSize,
              scale: Math.max(imageScale, nextScale),
              offset: current,
            })
            return nextTransform.offset.x === current.x && nextTransform.offset.y === current.y
              ? current
              : nextTransform.offset
          })
        })
      }
    },
    [
      imageScale,
      imageTransform.rotatedHeight,
      imageTransform.rotatedWidth,
      layout.cropSize,
      maxCropSize,
      naturalSize.h,
      naturalSize.w,
      rotation,
      setCropSizeIfChanged,
      setOffsetIfChanged,
    ],
  )

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      handlePointerMove(e as unknown as React.PointerEvent<HTMLDivElement>)
    },
    [handlePointerMove],
  )

  const handleRotateLeft = useCallback(() => {
    const nextRotation = rotateLeft(rotation)
    const coverScale = computeCoverScale(
      naturalSize.w,
      naturalSize.h,
      nextRotation,
      layout.cropSize,
    )
    const nextScale = Math.max(imageScale, coverScale)
    const nextTransform = computeInitialImageTransform({
      naturalW: naturalSize.w,
      naturalH: naturalSize.h,
      rotation: nextRotation,
      cropSize: layout.cropSize,
      scale: nextScale,
      offset,
    })
    setRotation(nextRotation)
    setImageScale(nextScale)
    setOffsetIfChanged(nextTransform.offset)
  }, [
    imageScale,
    layout.cropSize,
    naturalSize.h,
    naturalSize.w,
    offset,
    rotation,
    setOffsetIfChanged,
  ])

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const el = e.currentTarget
      const nextNaturalSize = { w: el.naturalWidth || 1, h: el.naturalHeight || 1 }
      const nextScale = computeCoverScale(
        nextNaturalSize.w,
        nextNaturalSize.h,
        rotation,
        layout.cropSize,
      )

      setNaturalSize(nextNaturalSize)
      setImageScale(nextScale)
      setNaturalLoaded(true)
      setOffset({ x: 0, y: 0 })
    },
    [layout.cropSize, rotation],
  )

  const resizeHandles: Array<{
    handle: CropResizeHandle
    label: string
    className: string
  }> = useMemo(
    () => [
      {
        handle: 'top-left',
        label: 'Redimensionar pelo canto superior esquerdo',
        className: '-left-2 -top-2 cursor-nwse-resize',
      },
      {
        handle: 'top-right',
        label: 'Redimensionar pelo canto superior direito',
        className: '-right-2 -top-2 cursor-nesw-resize',
      },
      {
        handle: 'bottom-left',
        label: 'Redimensionar pelo canto inferior esquerdo',
        className: '-bottom-2 -left-2 cursor-nesw-resize',
      },
      {
        handle: 'bottom-right',
        label: 'Redimensionar pelo canto inferior direito',
        className: '-bottom-2 -right-2 cursor-nwse-resize',
      },
    ],
    [],
  )

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
    <Dialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[70] max-h-[90vh] w-[96vw] max-w-[680px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-[0.97] duration-150 sm:w-[94vw]"
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            onCancel()
          }}
          onInteractOutside={onCancel}
        >
          <div className="border-b border-border px-6 py-5">
            <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Arraste a imagem para centralizar. Ajuste o quadrado pelas bordas e use girar se
              necessário.
            </Dialog.Description>
          </div>

          <div className="flex max-h-[calc(90vh-8.25rem)] flex-col items-center gap-4 overflow-y-auto px-5 py-6 sm:px-6">
            <p className="max-w-[34rem] text-center text-xs text-muted-foreground">
              Arraste a imagem para centralizar. Ajuste o quadrado pelas bordas e use girar se
              necessário.
            </p>

            <div ref={stageShellRef} className="w-full max-w-[560px]">
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
                onPointerUp={stopInteraction}
                onPointerCancel={stopInteraction}
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
                    onLoad={handleImageLoad}
                    data-testid="avatar-crop-image"
                    style={{
                      position: 'absolute',
                      width: imageTransform.displayWidth,
                      height: imageTransform.displayHeight,
                      left: '50%',
                      top: '50%',
                      transform: `translate3d(calc(-50% + ${imageTransform.offset.x}px), calc(-50% + ${imageTransform.offset.y}px), 0) rotate(${rotation}deg)`,
                      transformOrigin: 'center center',
                      opacity: naturalLoaded ? 1 : 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                      maxWidth: 'none',
                      willChange: isDragging || isResizing ? 'transform' : 'auto',
                    }}
                  />
                )}

                <div
                  className="pointer-events-none absolute border border-white/60 ring-1 ring-primary/30"
                  data-testid="crop-square-frame"
                  aria-hidden="true"
                  style={{
                    width: layout.cropSize,
                    height: layout.cropSize,
                    left: layout.cropLeft,
                    top: layout.cropTop,
                    boxShadow: '0 0 0 999px rgba(15,23,42,0.28)',
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
                {resizeHandles.map(({ handle, label, className }) => (
                  <button
                    key={handle}
                    type="button"
                    aria-label={label}
                    data-testid={`crop-resize-handle-${handle}`}
                    className={cn(
                      'absolute z-10 h-5 w-5 rounded-full border border-white/80 bg-card/90 shadow-sm',
                      'ring-2 ring-primary/25 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      className,
                    )}
                    style={{
                      left: className.includes('left') ? layout.cropLeft : undefined,
                      right: className.includes('right')
                        ? layout.stageWidth - layout.cropLeft - layout.cropSize
                        : undefined,
                      top: className.includes('top') ? layout.cropTop : undefined,
                      bottom: className.includes('bottom')
                        ? layout.stageHeight - layout.cropTop - layout.cropSize
                        : undefined,
                      touchAction: 'none',
                    }}
                    onPointerDown={(e) => handleResizePointerDown(handle, e)}
                    onPointerMove={handleResizePointerMove}
                    onPointerUp={stopInteraction}
                    onPointerCancel={stopInteraction}
                  />
                ))}
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
