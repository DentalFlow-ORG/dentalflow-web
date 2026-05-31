import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  Mic,
  RotateCcw,
  Sparkles,
  Square,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGlobalAlerts } from '@/components/common/global-alerts-context'
import { getCachedBillingStatus } from '@/features/billing/services/billing-status-cache'

import { dictateClinicalRecord } from '../services/clinical-dictation.service'
import type { ClinicalDictationFieldKey } from '../types/clinical-dictation.types'
import { getClinicalDictationErrorMessage } from '../utils/clinical-dictation-error'

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_RECORDING_SECONDS = 90
const TRANSCRIPT_COLLAPSE_THRESHOLD = 150
// Must match (and stay below) the backend DTO's MAX_AUDIO_BASE64_LENGTH so the
// frontend blocks oversized audio before sending and shows a useful message
// rather than getting a 413 from the server.
const MAX_AUDIO_BASE64_LENGTH = 6_500_000
// Conservative bitrate hint for MediaRecorder. Browsers may ignore it, but it
// keeps most recordings well under the size limit (90 s × 48 kbps ≈ 540 KB raw).
const AUDIO_BITS_PER_SECOND = 48_000

const DICTATION_FIELD_LABELS: Record<ClinicalDictationFieldKey, string> = {
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
  // Return '' so the caller passes undefined options to MediaRecorder, letting
  // the browser choose its native default format instead of guessing 'audio/webm'.
  return ''
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
function blobToBase64(blob: Blob): Promise<string> {
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
   * Called after the dentist reviews and accepts the selected suggestions.
   * Receives only the fields the dentist chose to apply.
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
        <div className="flex flex-col items-center gap-4 py-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mic className="h-7 w-7 text-primary/30" />
          </div>
          <div className="h-7 w-32 rounded-lg bg-primary/10" />
        </div>
      </div>
      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-card/90 px-4 text-center backdrop-blur-[1px]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Ditado por voz</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Grave a consulta e a IA organiza o conteúdo nos campos do prontuário
            automaticamente. Exclusivo do plano Premium.
          </p>
        </div>
        <Button size="sm" variant="outline" asChild className="mt-0.5 text-xs">
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

  const [state, setState]                   = useState<DictationState>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [transcript, setTranscript]         = useState<string | null>(null)
  const [transcriptExpanded, setTranscriptExpanded] = useState(false)
  const [suggestedFields, setSuggestedFields] = useState<Partial<Record<ClinicalDictationFieldKey, string>>>({})
  // Which fields the dentist has selected for application (all selected by default).
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<Set<ClinicalDictationFieldKey>>(new Set())
  const [errorMessage, setErrorMessage]     = useState<string | null>(null)

  const mediaRecorderRef      = useRef<MediaRecorder | null>(null)
  const chunksRef             = useRef<Blob[]>([])
  const timerRef              = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef             = useRef<MediaStream | null>(null)
  const startTimeRef          = useRef<number>(0)
  // Mirrors the elapsed seconds state without a stale closure — used by the
  // auto-stop logic so it can read the current count from a setInterval
  // callback without depending on the state updater form.
  const elapsedRef            = useRef(0)
  // Tracks whether the component is still mounted. Set to false before any
  // cleanup so that onstop-triggered processAudio() calls are ignored after
  // unmount, preventing state updates and stray API calls.
  const isMountedRef          = useRef(true)
  // Fired 5 s after stopRecording() if onstop never arrives (browser bug/hang).
  const stopFallbackTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Prevents onstop and the fallback timer from both processing the same stop.
  const hasProcessedStopRef   = useRef(false)
  // Fired 45 s after processAudio starts if the API call never settles.
  const processingTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Set to true when the processing phase is aborted (by timeout or reset) so
  // a still-running processAudio does not overwrite state afterwards.
  const processingAbortedRef  = useRef(false)

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    // React 18 Strict Mode runs the cleanup of every effect once before the real
    // mount (simulating unmount/remount). Without this reset, isMountedRef would
    // remain false after the Strict Mode cycle, silently blocking every async
    // guard in processAudio and the fallback timers.
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
      if (stopFallbackTimerRef.current) clearTimeout(stopFallbackTimerRef.current)
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current)
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
    if (stopFallbackTimerRef.current) {
      clearTimeout(stopFallbackTimerRef.current)
      stopFallbackTimerRef.current = null
    }
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
      processingTimeoutRef.current = null
    }
    hasProcessedStopRef.current = false
    // Abort any still-running processAudio so it doesn't overwrite the idle state.
    processingAbortedRef.current = true
    releaseStream()
    mediaRecorderRef.current = null
    chunksRef.current = []
    elapsedRef.current = 0
    setElapsedSeconds(0)
    setTranscript(null)
    setTranscriptExpanded(false)
    setSuggestedFields({})
    setSelectedFieldKeys(new Set())
    setErrorMessage(null)
    setState('idle')
  }, [stopTimer, releaseStream])

  const processAudio = useCallback(
    async (blob: Blob, mimeType: string, durationSeconds: number) => {
      // The component may have been unmounted while recording (e.g. the dentist
      // navigated away). Bail out early so we never fire an API call or update
      // state on an unmounted component.
      if (!isMountedRef.current) return

      // Reset the abort flag for this new processing session.
      processingAbortedRef.current = false

      setState('processing')
      stopTimer()
      releaseStream()

      // Safety net: if the API call does not settle within 45 s (worst-case is
      // two 15 s request timeouts plus an auth-refresh round-trip), surface a
      // friendly error rather than leaving the user on the spinner indefinitely.
      if (processingTimeoutRef.current) clearTimeout(processingTimeoutRef.current)
      processingTimeoutRef.current = setTimeout(() => {
        processingTimeoutRef.current = null
        if (!isMountedRef.current || processingAbortedRef.current) return
        processingAbortedRef.current = true
        const msg = 'O processamento demorou muito. Verifique sua conexão e tente novamente.'
        setErrorMessage(msg)
        setState('error')
        showAlert({ title: 'Tempo limite excedido', description: msg, tone: 'error' })
      }, 45_000)

      const clearProcessingTimeout = () => {
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current)
          processingTimeoutRef.current = null
        }
      }

      try {
        const audioBase64 = await blobToBase64(blob)
        // Check after the async conversion — unmount or abort may have happened.
        if (!isMountedRef.current || processingAbortedRef.current) {
          clearProcessingTimeout()
          return
        }

        // Front-end size guard — prevents a PayloadTooLargeError from the server
        // and surfaces a specific, actionable message before any network call.
        if (audioBase64.length > MAX_AUDIO_BASE64_LENGTH) {
          clearProcessingTimeout()
          if (!isMountedRef.current || processingAbortedRef.current) return
          processingAbortedRef.current = true
          const msg =
            'O áudio ficou muito grande para processamento. Grave um áudio mais curto e tente novamente.'
          setErrorMessage(msg)
          setState('error')
          showAlert({ title: 'Áudio muito grande', description: msg, tone: 'error' })
          return
        }

        const result = await dictateClinicalRecord(recordId, {
          audioBase64,
          mimeType,
          durationSeconds: Math.max(1, Math.round(durationSeconds)),
        })
        // Check after the API call — unmount, reset, or timeout may have fired.
        if (!isMountedRef.current || processingAbortedRef.current) {
          clearProcessingTimeout()
          return
        }

        clearProcessingTimeout()
        setTranscript(result.transcript)
        setSuggestedFields(result.fields)
        // Select all returned fields by default so the dentist can review and
        // unselect any they don't want to apply.
        setSelectedFieldKeys(new Set(Object.keys(result.fields) as ClinicalDictationFieldKey[]))
        setState('success')
      } catch (err: unknown) {
        clearProcessingTimeout()
        // If the timeout or a reset already handled the error path, ignore this.
        if (!isMountedRef.current || processingAbortedRef.current) return
        processingAbortedRef.current = true
        const message = getClinicalDictationErrorMessage(err)
        setErrorMessage(message)
        setState('error')
        showAlert({ title: 'Erro no ditado clínico', description: message, tone: 'error' })
      }
    },
    [recordId, stopTimer, releaseStream, showAlert],
  )

  // ── Recording controls ──────────────────────────────────────────────────────

  // Declared before startRecording so startRecording can reference it in the
  // auto-stop interval without a stale-closure or TDZ (temporal dead zone) issue.
  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    // Already stopped or nothing to stop — return safely without touching state.
    if (!recorder || recorder.state === 'inactive') return

    // ── Immediately leave 'recording' state ─────────────────────────────────
    // Real browsers fire onstop asynchronously (after the call stack unwinds).
    // Waiting for it before updating the UI causes the visible "stuck recording"
    // bug. Transition to 'processing' here so the UI is never stuck.
    stopTimer()
    setState('processing')

    // ── Fallback: recover if onstop never arrives ────────────────────────────
    // Some browsers hang or never fire onstop after stop() (e.g. when the tab
    // is backgrounded or a hardware error occurs). After 5 s we surface a
    // friendly error instead of leaving the user on the processing spinner.
    if (stopFallbackTimerRef.current) clearTimeout(stopFallbackTimerRef.current)
    stopFallbackTimerRef.current = setTimeout(() => {
      stopFallbackTimerRef.current = null
      if (!isMountedRef.current || hasProcessedStopRef.current) return
      hasProcessedStopRef.current = true
      releaseStream()
      mediaRecorderRef.current = null
      const msg = 'Não foi possível finalizar a gravação. Tente novamente.'
      setErrorMessage(msg)
      setState('error')
      showAlert({ title: 'Erro na gravação', description: msg, tone: 'error' })
    }, 5000)

    try {
      recorder.requestData?.() // flush any audio still buffered in the encoder
      recorder.stop()
    } catch {
      // stop() may throw InvalidStateError if the recorder is mid-transition.
      // The fallback timer above handles the stuck-processing case if onstop
      // never fires as a result.
    }
  }, [stopTimer, releaseStream, showAlert])

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

      const preferredMime = getSupportedMimeType()
      // AUDIO_BITS_PER_SECOND is a conservative hint — browsers may ignore it.
      // Keeping bitrate low reduces base64 payload size and avoids 413 errors.
      const recorder = new MediaRecorder(stream, {
        ...(preferredMime ? { mimeType: preferredMime } : {}),
        audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
      })
      // Read the actual format the browser committed to — may differ from preferredMime
      // when preferredMime is '' and the browser chose its own default.
      const effectiveMime = recorder.mimeType || preferredMime || 'audio/webm'
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      startTimeRef.current = Date.now()

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        // Cancel the fallback safety timer — onstop arrived as expected.
        if (stopFallbackTimerRef.current) {
          clearTimeout(stopFallbackTimerRef.current)
          stopFallbackTimerRef.current = null
        }

        if (!isMountedRef.current) return
        // Guard: prevents duplicate processing if onstop somehow fires twice
        // or the fallback timer already handled an error path.
        if (hasProcessedStopRef.current) return
        hasProcessedStopRef.current = true

        const durationSeconds = (Date.now() - startTimeRef.current) / 1000
        const capturedChunks = chunksRef.current.slice()
        chunksRef.current = []
        mediaRecorderRef.current = null
        releaseStream()

        if (capturedChunks.length === 0) {
          // No audio chunks arrived (e.g. stop() called before first timeslice).
          const msg = 'Nenhum áudio foi capturado. Verifique o microfone e tente novamente.'
          setErrorMessage(msg)
          setState('error')
          showAlert({ title: 'Gravação sem áudio', description: msg, tone: 'error' })
          return
        }

        const blob = new Blob(capturedChunks, { type: effectiveMime })
        void processAudio(blob, effectiveMime, durationSeconds)
      }

      // Reset the processing guard for this new recording session.
      hasProcessedStopRef.current = false
      recorder.start(250)
      setState('recording')
      elapsedRef.current = 0
      setElapsedSeconds(0)

      timerRef.current = setInterval(() => {
        // Increment the ref synchronously so the auto-stop check below reads the
        // correct value without relying on React state (which can be stale inside
        // a closure).  The state update is kept as a separate plain call — never
        // inside the setElapsedSeconds updater — so we avoid performing side
        // effects inside a React state updater (which Strict Mode invokes twice).
        elapsedRef.current += 1
        setElapsedSeconds(elapsedRef.current)

        if (elapsedRef.current >= MAX_RECORDING_SECONDS) {
          // Auto-stop via the same path used by the manual stop button so both
          // paths are always in sync.  stopRecording() clears the timer first,
          // preventing this branch from running again on the next tick.
          stopRecording()
        }
      }, 1000)
    } catch (err: unknown) {
      // Release any acquired stream — getUserMedia may have succeeded before the
      // error, so we must stop the tracks to free the microphone.
      releaseStream()
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
  }, [readOnly, state, processAudio, releaseStream, showAlert, stopRecording])

  // ── Apply / discard ─────────────────────────────────────────────────────────

  const handleApply = useCallback(() => {
    // Build the subset of fields the dentist chose to keep
    const toApply = Object.fromEntries(
      Object.entries(suggestedFields).filter(([key]) =>
        selectedFieldKeys.has(key as ClinicalDictationFieldKey),
      ),
    ) as Partial<Record<ClinicalDictationFieldKey, string>>

    onApplyFields(toApply)
    showAlert({
      title: 'Sugestões aplicadas',
      description: 'Os campos foram preenchidos com o conteúdo do ditado.',
      tone: 'success',
    })
    reset()
  }, [suggestedFields, selectedFieldKeys, onApplyFields, showAlert, reset])

  const handleDiscard = useCallback(() => {
    reset()
  }, [reset])

  const toggleFieldSelection = useCallback((key: ClinicalDictationFieldKey) => {
    setSelectedFieldKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  // ── Derived values ──────────────────────────────────────────────────────────

  const fieldEntries = Object.entries(suggestedFields) as [ClinicalDictationFieldKey, string][]
  const hasFields = fieldEntries.length > 0
  const canApply = selectedFieldKeys.size > 0
  const transcriptIsLong = (transcript?.length ?? 0) > TRANSCRIPT_COLLAPSE_THRESHOLD

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLocked) return <LockedState />

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* ── Card header ── */}
      <div className="mb-4 flex items-center gap-2.5">
        <Mic className="h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
        <span className="text-sm font-semibold text-foreground">Ditado por voz</span>
        <span className="ml-auto inline-flex shrink-0 items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
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
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10">
            <Mic className="h-6 w-6 text-primary/60" aria-hidden="true" />
          </div>
          <p className="max-w-50 text-xs leading-relaxed text-muted-foreground">
            Grave a consulta e a IA organiza o conteúdo nos campos corretos do prontuário.
          </p>
          <Button
            type="button"
            className="min-h-11 w-full"
            onClick={() => void startRecording()}
          >
            <Mic className="h-4 w-4" aria-hidden="true" />
            Gravar consulta
          </Button>
        </div>
      )}

      {/* ── Recording ── */}
      {!readOnly && state === 'recording' && (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          {/* Animated pulse ring */}
          <div className="relative flex items-center justify-center">
            <span className="absolute h-16 w-16 animate-ping rounded-full bg-red-500/15" aria-hidden="true" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200 dark:bg-red-950/30 dark:ring-red-800/50">
              <Mic className="h-6 w-6 text-red-500 dark:text-red-400" aria-hidden="true" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
              <span className="text-sm font-semibold text-foreground">Gravando</span>
            </div>
            <span
              className="mt-1 block tabular-nums text-xl font-bold tracking-tight text-foreground"
              aria-live="polite"
              aria-label={`Tempo de gravação: ${formatTime(elapsedSeconds)}`}
            >
              {formatTime(elapsedSeconds)}
            </span>
            {elapsedSeconds >= 80 && (
              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                Encerrando em {MAX_RECORDING_SECONDS - elapsedSeconds}s
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-950/20"
            onClick={stopRecording}
          >
            <Square className="h-4 w-4" aria-hidden="true" />
            Parar gravação
          </Button>
        </div>
      )}

      {/* ── Processing ── */}
      {!readOnly && state === 'processing' && (
        <div className="flex flex-col items-center gap-3 py-4 text-center" role="status">
          <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">Processando ditado…</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Transcrevendo e organizando nos campos clínicos
            </p>
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {!readOnly && state === 'success' && (
        <div className="space-y-4">
          {/* Transcript panel — collapsible for long text */}
          {transcript && (
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Transcrição
                </p>
                <div className="flex items-center gap-2">
                  {transcriptIsLong && (
                    <button
                      type="button"
                      aria-expanded={transcriptExpanded}
                      onClick={() => setTranscriptExpanded((e) => !e)}
                      className="text-[11px] text-primary underline-offset-2 hover:underline"
                    >
                      {transcriptExpanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                  )}
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    PT-BR
                  </span>
                </div>
              </div>
              <p
                className={cn(
                  'rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs leading-relaxed text-foreground',
                  transcriptIsLong && !transcriptExpanded && 'line-clamp-3',
                )}
              >
                {transcript}
              </p>
            </div>
          )}

          {/* Intelligent routing panel + preview + actions */}
          {hasFields ? (
            <div>
              {/* Routing header */}
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Roteamento inteligente
                </p>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {selectedFieldKeys.size}/{fieldEntries.length} selecionado{selectedFieldKeys.size !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Field rows */}
              <ul className="space-y-1.5" aria-label="Selecione os campos a aplicar ao prontuário">
                {fieldEntries.map(([key, value]) => {
                  const isSelected = selectedFieldKeys.has(key)
                  return (
                    <li key={key}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 transition-colors',
                          isSelected
                            ? 'border-primary/25 bg-primary/5 dark:border-primary/20 dark:bg-primary/10'
                            : 'border-border bg-muted/20 hover:bg-muted/40',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                          checked={isSelected}
                          onChange={() => toggleFieldSelection(key)}
                          aria-label={`Selecionar campo ${DICTATION_FIELD_LABELS[key]}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="flex-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {DICTATION_FIELD_LABELS[key]}
                            </p>
                            <div className="flex shrink-0 items-center gap-1">
                              <ArrowRight className="h-3 w-3 text-muted-foreground/40" aria-hidden="true" />
                              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                                Revisar
                              </span>
                            </div>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-foreground">
                            {value}
                          </p>
                        </div>
                      </label>
                    </li>
                  )
                })}
              </ul>

              {/* Preview of what will be applied */}
              <div className="mt-3 rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Prévia do que será aplicado
                </p>
                {canApply ? (
                  <ul className="space-y-0.5">
                    {fieldEntries
                      .filter(([key]) => selectedFieldKeys.has(key))
                      .map(([key, value]) => (
                        <li key={key} className="flex min-w-0 gap-1.5 text-xs">
                          <span className="shrink-0 font-medium text-muted-foreground">
                            {DICTATION_FIELD_LABELS[key]}:
                          </span>
                          <span className="truncate text-foreground">{value}</span>
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Selecione ao menos um campo acima para aplicar.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-col gap-2">
                <Button
                  type="button"
                  className="min-h-11 w-full"
                  onClick={handleApply}
                  disabled={!canApply}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Aplicar ao prontuário
                </Button>
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
          ) : (
            /* Empty-field state — transcription captured but nothing classified */
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-950/20">
                <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                  A transcrição foi capturada, mas nenhum campo clínico foi identificado com
                  confiança suficiente. Tente incluir mais detalhes clínicos ao gravar.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="w-full"
                  onClick={reset}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Gravar novamente
                </Button>
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
        </div>
      )}

      {/* ── Error ── */}
      {!readOnly && state === 'error' && (
        <div className="space-y-3">
          {/* role="alert" causes screen readers to announce the message immediately
              when the component transitions into the error state. */}
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-800/50 dark:bg-red-950/20">
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
