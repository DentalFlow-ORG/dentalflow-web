import { useEffect, useRef, useState } from 'react'
import { Image, Trash2, Upload } from 'lucide-react'

import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { Button } from '@/components/ui/button'

import {
  addAttachmentMetadata,
  listAttachments,
  removeAttachment,
  updateAttachmentDescription,
} from '../services/clinical-records.service'
import type { ClinicalRecordAttachment } from '../types/clinical-record.types'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_OUTPUT_DIMENSION = 1200
const MAX_THUMBNAIL_DIMENSION = 200
const JPEG_QUALITY = 0.82
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB original
const CAPTION_DEBOUNCE_MS = 800

type Props = {
  recordId: string
  readOnly?: boolean
}

export function ImageAttachmentPanel({ recordId, readOnly = false }: Props) {
  const { showAlert } = useGlobalAlerts()
  const inputRef = useRef<HTMLInputElement>(null)

  const [attachments, setAttachments] = useState<ClinicalRecordAttachment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    let isCurrent = true
    setIsLoading(true)

    listAttachments(recordId)
      .then((data) => {
        if (isCurrent) setAttachments(data.filter((a) => a.dataBase64))
      })
      .catch(() => {
        if (isCurrent)
          showAlert({ title: 'Erro', description: 'Não foi possível carregar as imagens.', tone: 'error' })
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => { isCurrent = false }
  }, [recordId, showAlert])

  const compressImage = (file: File): Promise<{ dataBase64: string; thumbnailBase64: string; sizeBytes: number }> =>
    new Promise((resolve, reject) => {
      const img = new window.Image()
      const objectUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        const canvas = document.createElement('canvas')
        const thumb = document.createElement('canvas')

        const ratio = Math.min(MAX_OUTPUT_DIMENSION / img.width, MAX_OUTPUT_DIMENSION / img.height, 1)
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)

        const tRatio = Math.min(MAX_THUMBNAIL_DIMENSION / img.width, MAX_THUMBNAIL_DIMENSION / img.height, 1)
        thumb.width = Math.round(img.width * tRatio)
        thumb.height = Math.round(img.height * tRatio)
        thumb.getContext('2d')!.drawImage(img, 0, 0, thumb.width, thumb.height)

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
      showAlert({ title: 'Formato inválido', description: 'Envie apenas imagens JPEG, PNG ou WebP.', tone: 'error' })
      return
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      showAlert({ title: 'Imagem muito grande', description: 'O tamanho máximo permitido é 5 MB.', tone: 'error' })
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
      showAlert({ title: 'Imagem adicionada.', description: 'A imagem foi salva no prontuário.', tone: 'success' })
    } catch {
      showAlert({ title: 'Erro ao enviar', description: 'Não foi possível salvar a imagem. Tente novamente.', tone: 'error' })
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async (attachmentId: string) => {
    try {
      await removeAttachment(recordId, attachmentId)
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
      showAlert({ title: 'Imagem removida.', description: 'A imagem foi removida do prontuário.', tone: 'info' })
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
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">Imagens e anexos clínicos</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {readOnly
            ? 'As imagens clínicas estão disponíveis apenas para consulta neste status do prontuário.'
            : 'Envie imagens clínicas, exames ou fotos relacionadas ao atendimento. As imagens serão otimizadas para reduzir o uso de armazenamento.'}
        </p>
      </div>

      {!readOnly && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Enviando...' : 'Adicionar imagem'}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG ou WebP · máx. 5 MB por arquivo</p>
        </div>
      )}

      {attachments.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
          <Image className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Nenhuma imagem adicionada.</p>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {attachments.map((att) => (
            <AttachmentCard
              key={att.id}
              attachment={att}
              recordId={recordId}
              readOnly={readOnly}
              onRemove={readOnly ? undefined : () => handleRemove(att.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AttachmentCard({
  attachment,
  recordId,
  readOnly,
  onRemove,
}: {
  attachment: ClinicalRecordAttachment
  recordId: string
  readOnly: boolean
  onRemove?: () => void
}) {
  const [description, setDescription] = useState(attachment.description ?? '')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

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

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card">
      {src ? (
        <img
          src={src}
          alt={attachment.fileName}
          className="aspect-square w-full object-cover"
        />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-muted">
          <Image className="h-8 w-8 text-muted-foreground/40" />
        </div>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-card/90 text-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100"
          title="Remover imagem"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}

      <div className="p-2">
        <p className="truncate text-[11px] text-muted-foreground">{attachment.fileName}</p>
        <input
          type="text"
          placeholder="Legenda..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded border-0 bg-transparent p-0 text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          readOnly={readOnly}
        />
        {!readOnly && saveState === 'saving' && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">Salvando...</p>
        )}
        {!readOnly && saveState === 'saved' && (
          <p className="mt-0.5 text-[10px] text-emerald-500">Salvo</p>
        )}
      </div>
    </div>
  )
}
