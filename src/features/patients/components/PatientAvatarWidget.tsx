import { Camera, Loader2, Plus, X } from 'lucide-react'
import { useRef } from 'react'

import { cn } from '@/lib/utils'
import {
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_INPUT_BYTES,
  compressAvatar,
} from '@/lib/compress-avatar'

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
   * Called when file validation fails (wrong type, oversized, or canvas error).
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
  const inputRef = useRef<HTMLInputElement>(null)
  const sizeClass = SIZE[size]
  const isInteractive = Boolean(onUpload) && !isSaving

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.currentTarget.value = ''
    if (!file || !onUpload) return

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      onError?.('Formato inválido. Envie apenas JPEG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_AVATAR_INPUT_BYTES) {
      onError?.(`Arquivo muito grande. O tamanho máximo é ${MAX_AVATAR_INPUT_BYTES / 1024 / 1024} MB.`)
      return
    }
    try {
      const base64 = await compressAvatar(file)
      onUpload(base64)
    } catch {
      onError?.('Não foi possível processar a imagem.')
    }
  }

  return (
    <div className={cn('relative shrink-0', className)}>
      {/* Hidden file input — managed by the widget */}
      {onUpload && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={handleFile}
          disabled={isSaving}
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
      {/* Uses a named group so the Plus icon responds only to this button  */}
      {isInteractive && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
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

      {/* ── Camera badge — persistent add affordance for touch/mobile ───── */}
      {/* Shown at the bottom-right when no photo exists, so users on         */}
      {/* hover-less devices can still discover the avatar is interactive.    */}
      {isInteractive && !avatarUrl && (
        <span
          className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-2 ring-card"
          aria-hidden="true"
        >
          <Camera className="h-2.5 w-2.5" />
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
    </div>
  )
}
