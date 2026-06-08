import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Dialog } from 'radix-ui'

import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onCapture: (file: File) => void
  onCancel: () => void
}

export function CameraPreviewModal({ open, onCapture, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const stopStream = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop()
    streamRef.current = null
  }, [])

  useEffect(() => {
    if (!open) {
      setError(null)
      setIsReady(false)
      stopStream()
      return
    }

    let cancelled = false

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (cancelled) {
          for (const track of stream.getTracks()) track.stop()
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setIsReady(true)
        }
      } catch (err: unknown) {
        if (cancelled) return
        let msg = 'Não foi possível acessar a câmera.'
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            msg = 'Permissão de câmera negada. Verifique as configurações do navegador.'
          } else if (err.name === 'NotFoundError') {
            msg = 'Nenhuma câmera encontrada. Conecte uma câmera e tente novamente.'
          }
        }
        setError(msg)
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      stopStream()
    }
  }, [open, stopStream])

  const handleCapture = () => {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' })
      stopStream()
      onCapture(file)
    }, 'image/jpeg', 0.9)
  }

  const handleCancel = useCallback(() => {
    stopStream()
    onCancel()
  }, [stopStream, onCancel])

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) handleCancel() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-150" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in-0 zoom-in-[0.97] duration-150"
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            handleCancel()
          }}
          onInteractOutside={handleCancel}
        >
          <div className="border-b border-border px-5 py-4">
            <Dialog.Title className="text-base font-semibold text-foreground">
              Tirar foto
            </Dialog.Title>
            <Dialog.Description className="mt-0.5 text-xs text-muted-foreground">
              Posicione o rosto na câmera e clique em Capturar foto.
            </Dialog.Description>
          </div>

          <div className="flex flex-col items-center gap-4 px-5 py-6">
            {error ? (
              <div
                role="alert"
                className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-300"
              >
                {error}
              </div>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
                {!isReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white/60" aria-hidden="true" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                  aria-label="Visualização da câmera"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            {!error && (
              <Button type="button" onClick={handleCapture} disabled={!isReady}>
                <Camera className="h-4 w-4" aria-hidden="true" />
                Capturar foto
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
