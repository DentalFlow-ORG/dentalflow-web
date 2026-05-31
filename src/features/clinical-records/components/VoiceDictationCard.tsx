import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Mic,
  Sparkles,
  Square,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { getCachedBillingStatus } from '@/features/billing/services/billing-status-cache'

import { dictateClinicalRecord } from '../services/clinical-dictation.service'
import type { ClinicalDictationFieldKey } from '../types/clinical-dictation.types'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_RECORDING_SECONDS = 90

export const DICTATION_FIELD_LABELS: Record<ClinicalDictationFieldKey, string> = {
  chiefComplaint:      'Queixa principal',
  anamnesis:           'Anamnese',
  clinicalEvolution:   'Evolução clínica',
  diagnosis:           'Diagnóstico',
  proceduresPerformed: 'Procedimentos realizados',
  treatmentPlan:       'Plano de tratamento',
  prescription:        'Prescrição',
  recommendations:     'Recomendações',
  privateNotes:        'Notas privadas',
}

// ── Audio helpers ─────────────────────────────────────────────────────────────

function getSupportedMimeType(): string {
  const candidates = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg']
  if (typeof MediaRecorder !== 'undefined') {
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type
    }
  }
  return 'audio/webm'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/**
 * Converts a Blob to a raw base64 string (no data-URL prefix).
 * The caller is responsible for discarding the blob after this call.
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Conversão de áudio falhou'))
        return
      }
      // Strip "data:<mime>;base64," prefix — send only the payload
      const base64 = reader.result.split(',')[1]
      if (!base64) {
        reject(new Error('Conversão de áudio falhou'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Leitura do áudio falhou'))
    reader.readAsDataURL(blob)
  })
}

// ── Types ─────────────────────────────────────────────────────────────────────

type DictationState = 'idle' | 'recording' | 'processing' | 'success' | 'error'

type Props = {
  recordId: string
  /** True when the record is not DRAFT — recording is blocked and a notice is shown. */
  readOnly: boolean
  /**
   * Called after the dentist reviews and accepts suggestions.
   * The container is responsible for merging these into the draft.
   */
  onApplyFields: (fields: Partial<Record<ClinicalDictationFieldKey, string>>) => void
}

// ── Locked (non-premium) state ────────────────────────────────────────────────

function LockedState() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
      {/* Blurred background — hinted recording UI */}
      <div aria-hidden="true" className="pointer-events-none select-none blur-[2px]">
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mic className="h-6 w-6 text-primary/30" />
          </div>
          <div className="h-7 w-28 rounded-lg bg-primary/10" />
        </div>
      </div>
      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 rounded-xl bg-card/90 px-4 text-center backdrop-blur-[1px]">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Ditado por voz</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Grave a consulta e a IA organizará o conteúdo nos campos do prontuário.
            Disponível no plano Premium.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild className="text-xs">
          <a href="/app/assinatura">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            Ver planos
          </a>
        </Button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function VoiceDictationCard({ recordId, readOnly, onApplyFields }: Props) {
  const { showAlert } = useGlobalAlerts()

  // Plan gate — lock for starter/professional; unlock for premium or null (admin/cache miss).
  // Backend enforces the real check; this is defense-in-depth UX only.
  const planKey = getCachedBillingStatus()?.planKey
  const isLocked = planKey === 'starter' || planKey === 'professional'

  const [state, setState]                 = useState<DictationState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [transcript, setTranscript]       = useState<string | null>(null)
  const [suggestedFields, setSuggestedFields] = useState<Partial<Record<ClinicalDictationFieldKey, string>>>({})
  const [errorMessage, setErrorMessage]   = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef        = useRef<MediaStream | null>(null)
  const startTimeRef     = useRef<number>(0)

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      for (const track of streamRef.current?.getTracks() ?? []) track.stop()
    }
  }, [])

  // ── Internal helpers ────────────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const releaseStream = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop()
    streamRef.current = null
  }, [])

  const reset = useCallback(() => {
    stopTimer()
    releaseStream()
    mediaRecorderRef.current = null
    chunksRef.current = []
    setElapsedSeconds(0)
    setTranscript(null)
    setSuggestedFields({})
    setErrorMessage(null)
    setState('idle')
  }, [stopTimer, releaseStream])

  const processAudio = useCallback(
    async (blob: Blob, mimeType: string, durationSeconds: number) => {
      setState('processing')
      stopTimer()
      releaseStream()

      try {
        const audioBase64 = await blobToBase64(blob)
        // Discard the original blob now — do not hold audio in memory
        const result = await dictateClinicalRecord(recordId, {
          audioBase64,
          mimeType,
          durationSeconds: Math.max(1, Math.round(durationSeconds)),
        })
        setTranscript(result.transcript)
        setSuggestedFields(result.fields)
        setState('success')
      } catch (err: unknown) {
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'Não foi possível processar o ditado. Tente novamente.'
        setErrorMessage(message)
        setState('error')
        showAlert({ title: 'Erro no ditado clínico', description: message, tone: 'error' })
      }
    },
    [recordId, stopTimer, releaseStream, showAlert],
  )

  // ── Recording controls ──────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    if (readOnly || state !== 'idle') return

    // Guard: browser support checks
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = 'Seu navegador não suporta gravação de áudio. Use Chrome ou Edge.'
      setErrorMessage(msg)
      setState('error')
      showAlert({ title: 'Navegador incompatível', description: msg, tone: 'error' })
      return
    }
    if (typeof MediaRecorder === 'undefined') {
      const msg = 'Gravação de áudio não é suportada neste navegador.'
      setErrorMessage(msg)
      setState('error')
      showAlert({ title: 'Navegador incompatível', description: msg, tone: 'error' })
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getSupportedMimeType()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      startTimeRef.current = Date.now()

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const durationSeconds = (Date.now() - startTimeRef.current) / 1000
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        chunksRef.current = [] // free memory immediately
        void processAudio(blob, mimeType || 'audio/webm', durationSeconds)
      }

      recorder.start(250)
      setState('recording')
      setElapsedSeconds(0)

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1
          if (next >= MAX_RECORDING_SECONDS) {
            // Auto-stop — call through the recorder directly to avoid stale closure
            if (mediaRecorderRef.current?.state === 'recording') {
              mediaRecorderRef.current.stop()
            }
          }
          return next
        })
      }, 1000)
    } catch (err: unknown) {
      let msg = 'Não foi possível iniciar a gravação.'
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          msg = 'Permissão de microfone negada. Verifique as configurações do navegador.'
        } else if (err.name === 'NotFoundError') {
          msg = 'Nenhum microfone encontrado. Conecte um microfone e tente novamente.'
        }
      }
      setErrorMessage(msg)
      setState('error')
      showAlert({ title: 'Erro de microfone', description: msg, tone: 'error' })
    }
  }, [readOnly, state, processAudio, showAlert])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    stopTimer()
  }, [stopTimer])

  // ── Apply / discard ─────────────────────────────────────────────────────────

  const handleApply = useCallback(() => {
    onApplyFields(suggestedFields)
    showAlert({
      title: 'Sugestões aplicadas',
      description: 'Os campos foram preenchidos com o conteúdo do ditado.',
      tone: 'success',
    })
    reset()
  }, [suggestedFields, onApplyFields, showAlert, reset])

  const handleDiscard = useCallback(() => {
    reset()
  }, [reset])

  // ── Derived values ──────────────────────────────────────────────────────────

  const fieldEntries = Object.entries(suggestedFields) as [ClinicalDictationFieldKey, string][]
  const hasFields = fieldEntries.length > 0

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLocked) return <LockedState />

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <Mic className="h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">Ditado por voz</span>
        <span className="ml-auto inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Premium
        </span>
      </div>

      {/* ── Read-only notice ── */}
      {readOnly && (
        <p className="text-xs text-muted-foreground">
          Disponível apenas em prontuários em rascunho.
        </p>
      )}

      {/* ── Idle ── */}
      {!readOnly && state === 'idle' && (
        <div className="flex flex-col items-center gap-3 py-1 text-center">
          <p className="text-xs text-muted-foreground">
            Grave a consulta e a IA organizará o conteúdo nos campos corretos.
          </p>
          <Button
            type="button"
            className="min-h-[44px] w-full"
            onClick={() => void startRecording()}
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            Gravar consulta
          </Button>
        </div>
      )}

      {/* ── Recording ── */}
      {!readOnly && state === 'recording' && (
        <div className="flex flex-col items-center gap-3 py-1 text-center">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500"
              aria-hidden="true"
            />
            <span className="text-sm font-semibold text-foreground">Gravando…</span>
            <span
              className="tabular-nums text-sm text-muted-foreground"
              aria-live="polite"
              aria-label={`Tempo de gravação: ${formatTime(elapsedSeconds)}`}
            >
              {formatTime(elapsedSeconds)}
            </span>
          </div>
          {elapsedSeconds >= 80 && (
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              Encerrando em {MAX_RECORDING_SECONDS - elapsedSeconds}s
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            className="min-h-[44px] w-full"
            onClick={stopRecording}
            aria-label="Parar gravação"
          >
            <Square className="h-4 w-4" aria-hidden="true" />
            Parar gravação
          </Button>
        </div>
      )}

      {/* ── Processing ── */}
      {!readOnly && state === 'processing' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Transcrevendo e organizando…</p>
        </div>
      )}

      {/* ── Success ── */}
      {!readOnly && state === 'success' && (
        <div className="space-y-4">
          {/* Transcript */}
          {transcript && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Transcrição
              </p>
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-foreground">
                {transcript}
              </p>
            </div>
          )}

          {/* Suggested fields */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Campos sugeridos
            </p>
            {hasFields ? (
              <ul className="space-y-2" aria-label="Campos sugeridos pelo ditado">
                {fieldEntries.map(([key, value]) => (
                  <li key={key} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {DICTATION_FIELD_LABELS[key]}
                    </p>
                    <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-foreground">
                      {value}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                Nenhum campo foi classificado com confiança. Revise a transcrição.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {hasFields && (
              <Button
                type="button"
                className="w-full"
                onClick={handleApply}
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Aplicar aos campos
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDiscard}
            >
              Descartar
            </Button>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {!readOnly && state === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800/50 dark:bg-red-950/20">
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400"
              aria-hidden="true"
            />
            <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">
              {errorMessage ?? 'Não foi possível processar o ditado.'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={reset}
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  )
}
