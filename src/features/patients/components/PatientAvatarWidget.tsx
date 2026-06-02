import { Camera, ImageIcon, Loader2, Plus, Upload, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

import { cn } from '@/lib/utils'
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_INPUT_BYTES } from '@/lib/compress-avatar'
import { AvatarCropModal } from './AvatarCropModal'

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ── Size map ──────────────────────────────────────────────────────────────────

const SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  name: string
  /** Raw base64 JPEG string (no data-URL prefix) returned from the avatar API. */
  avatarUrl?: string | null
  isSaving?: boolean
  /**
   * When provided, the circle becomes an interactive upload button.
   * Callback receives compressed base64 (or null to remove the photo).
   */
  onUpload?: (base64: string | null) => void
  /**
   * Called when file validation fails or canvas export fails.
   * Lets callers surface the error in their own alert/toast system.
   */
  onError?: (message: string) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PatientAvatarWidget({
  name,
  avatarUrl,
  isSaving = false,
  onUpload,
  onError,
  size = 'md',
  className,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [showSourcePicker, setShowSourcePicker] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const sizeClass = SIZE[size]
  const isInteractive = Boolean(onUpload) && !isSaving

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.currentTarget.value = ''
    if (!file || !onUpload) return

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      onError?.('Formato inválido. Envie apenas JPEG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_AVATAR_INPUT_BYTES) {
      onError?.(
        `Arquivo muito grande. O tamanho máximo é ${MAX_AVATAR_INPUT_BYTES / 1024 / 1024} MB.`,
      )
      return
    }
    setPendingFile(file)
  }

  const handleCropConfirm = (base64: string) => {
    setPendingFile(null)
    onUpload?.(base64)
  }

  const handleCropCancel = () => {
    setPendingFile(null)
  }

  const handleCropError = (message: string) => {
    onError?.(message)
  }

  // Close the source picker when the user presses Escape
  useEffect(() => {
    if (!showSourcePicker) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSourcePicker(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showSourcePicker])

  return (
    <div className={cn('relative shrink-0', className)}>
      {/* Hidden gallery input — no capture attribute → file picker / gallery */}
      {onUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isSaving}
          aria-hidden="true"
        />
      )}

      {/* Hidden camera input — capture="user" → webcam / front camera */}
      {onUpload && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="user"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isSaving}
          aria-hidden="true"
        />
      )}

      {/* ── Avatar circle — content layer ───────────────────────────────── */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold select-none',
          sizeClass,
          avatarUrl
            ? 'bg-transparent'
            : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground',
        )}
        aria-hidden="true"
      >
        {avatarUrl ? (
          <img
            src={`data:image/jpeg;base64,${avatarUrl}`}
            alt={name}
            className={cn('rounded-full object-cover', sizeClass)}
          />
        ) : (
          getAvatarInitials(name)
        )}
      </div>

      {/* ── Upload button — covers the full circle ─────────────────────── */}
      {isInteractive && (
        <button
          type="button"
          onClick={() => setShowSourcePicker((s) => !s)}
          aria-label={avatarUrl ? 'Alterar foto do paciente' : 'Adicionar foto do paciente'}
          title={avatarUrl ? 'Alterar foto' : 'Adicionar foto'}
          className={cn(
            'group/circle absolute inset-0 flex items-center justify-center rounded-full',
            'cursor-pointer select-none',
            'bg-black/0 transition-colors duration-150',
            'hover:bg-black/45 focus-visible:bg-black/45',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-1 focus-visible:ring-offset-card',
          )}
        >
          <Plus
            className={cn(
              'text-white transition-opacity duration-150 pointer-events-none',
              'opacity-0 group-hover/circle:opacity-100 group-focus-visible/circle:opacity-100',
            )}
            style={{ width: '32%', height: '32%' }}
            aria-hidden="true"
          />
        </button>
      )}

      {/* ── Source picker — appears on circle click ─────────────────────── */}
      {isInteractive && showSourcePicker && (
        <>
          {/* Invisible full-screen backdrop — closes picker on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSourcePicker(false)}
            aria-hidden="true"
          />

          {/* Picker panel */}
          <div
            className={cn(
              'absolute left-0 z-50 mt-1 min-w-[11rem] rounded-xl border border-border bg-card p-1 shadow-lg',
              'top-full',
            )}
            role="menu"
            aria-label="Selecionar origem da foto"
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-sm text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              onClick={() => {
                setShowSourcePicker(false)
                fileInputRef.current?.click()
              }}
            >
              <Upload className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              Enviar imagem
            </button>

            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-3 text-sm text-foreground hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
              onClick={() => {
                setShowSourcePicker(false)
                cameraInputRef.current?.click()
              }}
            >
              <Camera className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              Tirar foto
            </button>
          </div>
        </>
      )}

      {/* ── Camera badge — persistent add affordance for touch/mobile ───── */}
      {isInteractive && !avatarUrl && !showSourcePicker && (
        <span
          className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-2 ring-card"
          aria-hidden="true"
        >
          <ImageIcon className="h-2.5 w-2.5" />
        </span>
      )}

      {/* ── Remove (×) button — top-right when a photo exists ───────────── */}
      {isInteractive && avatarUrl && (
        <button
          type="button"
          onClick={() => onUpload!(null)}
          aria-label="Remover foto do paciente"
          title="Remover foto"
          className={cn(
            'absolute -right-0.5 -top-0.5 z-10',
            'flex h-5 w-5 items-center justify-center',
            'rounded-full bg-red-500 text-white shadow-sm ring-2 ring-card',
            'transition-colors hover:bg-red-600',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1',
          )}
        >
          <X className="h-2.5 w-2.5" aria-hidden="true" />
        </button>
      )}

      {/* ── Saving spinner ───────────────────────────────────────────────── */}
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
          <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />
        </div>
      )}

      {/* ── Crop modal — opens after file/camera selection ───────────────── */}
      <AvatarCropModal
        open={pendingFile !== null}
        imageFile={pendingFile}
        patientName={name}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
        onError={handleCropError}
      />
    </div>
  )
}
