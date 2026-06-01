import { useRef } from 'react'
import { Camera, Loader2, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_INPUT_BYTES,
  compressAvatar,
} from '@/lib/compress-avatar'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type Props = {
  name: string
  avatarUrl?: string | null
  isSaving?: boolean
  /** When provided, enables the upload/remove controls */
  onUpload?: (base64: string | null) => void
  size?: 'md' | 'lg'
  className?: string
}

export function PatientAvatarWidget({
  name,
  avatarUrl,
  isSaving = false,
  onUpload,
  size = 'md',
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = size === 'lg' ? 'h-14 w-14 text-sm' : 'h-10 w-10 text-xs'

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.currentTarget.value = ''
    if (!file || !onUpload) return
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) return
    if (file.size > MAX_AVATAR_INPUT_BYTES) return
    try {
      const base64 = await compressAvatar(file)
      onUpload(base64)
    } catch { /* ignore */ }
  }

  return (
    <div className={cn('relative shrink-0', className)}>
      {/* Hidden file input */}
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

      {/* Avatar circle */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold',
          sizeClasses,
          avatarUrl
            ? 'bg-transparent'
            : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground',
        )}
        aria-hidden="true"
        title={name}
      >
        {avatarUrl ? (
          <img
            src={`data:image/jpeg;base64,${avatarUrl}`}
            alt={name}
            className={cn('rounded-full object-cover', sizeClasses)}
          />
        ) : (
          getInitials(name)
        )}
      </div>

      {/* Edit overlay button */}
      {onUpload && !isSaving && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm ring-2 ring-card transition-opacity hover:bg-primary/90"
          title="Alterar foto"
          aria-label="Alterar foto do paciente"
        >
          <Camera className="h-3 w-3" aria-hidden="true" />
        </button>
      )}

      {/* Remove overlay button — only when photo exists */}
      {onUpload && avatarUrl && !isSaving && (
        <button
          type="button"
          onClick={() => onUpload(null)}
          className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm ring-2 ring-card transition-opacity hover:bg-red-600"
          title="Remover foto"
          aria-label="Remover foto do paciente"
        >
          <Trash2 className="h-2.5 w-2.5" aria-hidden="true" />
        </button>
      )}

      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
          <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />
        </div>
      )}
    </div>
  )
}
