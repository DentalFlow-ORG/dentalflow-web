import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
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
import { formatDictationFieldText } from '../utils/format-dictation-field-text'
import { parseDictationOdontogram } from '../utils/parse-dictation-odontogram'
import type { OdontogramSuggestion } from '../utils/parse-dictation-odontogram'

// ── Constants ─────────────────────────────────────────────────────────────────

// At 32 kbps / 60 s the base64 payload is ~320 KB — even at worst-case bitrate
// (~256 kbps) a 60-second recording produces ~2.56 M chars, well below the
// backend DTO limit of 4 M chars and the 6 MB body-parser limit.
const MAX_RECORDING_SECONDS = 60
const TRANSCRIPT_COLLAPSE_THRESHOLD = 150
// Must match the backend DTO's MAX_AUDIO_BASE64_LENGTH so the frontend blocks
// oversized audio before sending rather than letting the server return 413.
const MAX_AUDIO_BASE64_LENGTH = 4_000_000
// 32 kbps is sufficient for speech-quality transcription with Whisper and keeps
// file sizes small even when the browser ignores the hint.
const AUDIO_BITS_PER_SECOND = 32_000

// Simulated processing-phase steps shown to the dentist.
// Steps advance through the real frontend lifecycle; steps 2→3 use a timer
// to approximate the transcription→classification handoff (no WebSocket needed).
const PROCESSING_STEPS = [
  'Preparando áudio…',
  'Enviando para análise…',
  'Transcrevendo consulta…',
  'Organizando nos campos clínicos…',
] as const

type ProcessingStep = 0 | 1 | 2 | 3

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
  // Prefer explicit Opus variants: Opus is highly efficient for speech and
  // produces much smaller files than browser-default codecs.  Explicit codec
  // strings also ensure the mimeType reported by recorder.mimeType matches
  // what the backend DTO allows.
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4',
  ]
  if (typeof MediaRecorder !== 'undefined') {
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) return type
    }
  }
  // Return '' so the caller passes no mimeType option to MediaRecorder, letting
  // the browser choose its native default format.
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
   * Receives only the fields the dentist chose to apply, already formatted.
   * The container is responsible for merging these into the draft.
   */
  onApplyFields: (fields: Partial<Record<ClinicalDictationFieldKey, string>>) => void
  /**
   * Optional. Called when the dentist applies odontogram marking suggestions.
   * Receives only the suggestions whose checkboxes were selected.
   * The container is responsible for merging into the existing odontogram data.
   */
  onApplyOdontogram?: (suggestions: OdontogramSuggestion[]) => void
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

export function VoiceDictationCard({ recordId, readOnly, onApplyFields, onApplyOdontogram }: Props) {
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
  // Which simulated processing step is currently shown (advances through lifecycle).
  const [processingStep, setProcessingStep] = useState<ProcessingStep>(0)
  // Dev-only: captured after base64 conversion so the debug panel can show
  // MIME type, payload size, recording duration, and whether it was blocked.
  // import.meta.env.DEV is false in production builds — Vite dead-code-eliminates
  // every branch that reads this state in the rendered output.
  const [debugInfo, setDebugInfo] = useState<{
    mimeType: string
    base64Chars: number
    durationSeconds: number
    blockedLocally: boolean
  } | null>(null)
  // Editable copy of suggestedFields — initialized on success, updated by the dentist.
  const [editableFields, setEditableFields] = useState<Partial<Record<ClinicalDictationFieldKey, string>>>({})
  // Odontogram marking suggestions parsed from the transcript on success.
  const [odontogramSuggestions, setOdontogramSuggestions] = useState<OdontogramSuggestion[]>([])
  // Editable note per odontogram suggestion, keyed by tooth number.
  const [editableOdontogramNotes, setEditableOdontogramNotes] = useState<Record<string, string>>({})
  // Which odontogram suggestions the dentist has selected (all by default).
  const [selectedOdontogramTeeth, setSelectedOdontogramTeeth] = useState<Set<string>>(new Set())
  // Inline warning shown when apply is attempted but no valid content remains.
  const [applyWarning, setApplyWarning] = useState<string | null>(null)

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
  // Advances processingStep to 3 after ~6 s of API wait (simulates the
  // transcription→classification handoff without any server-side events).
  const processingStepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
      if (processingStepTimerRef.current) clearTimeout(processingStepTimerRef.current)
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
    if (processingStepTimerRef.current) {
      clearTimeout(processingStepTimerRef.current)
      processingStepTimerRef.current = null
    }
    hasProcessedStopRef.current = false
    // Abort any still-running processAudio so it doesn't overwrite the idle state.
    processingAbortedRef.current = true
    setProcessingStep(0)
    setDebugInfo(null)
    releaseStream()
    mediaRecorderRef.current = null
    chunksRef.current = []
    elapsedRef.current = 0
    setElapsedSeconds(0)
    setTranscript(null)
    setTranscriptExpanded(false)
    setSuggestedFields({})
    setSelectedFieldKeys(new Set())
    setEditableFields({})
    setOdontogramSuggestions([])
    setEditableOdontogramNotes({})
    setSelectedOdontogramTeeth(new Set())
    setApplyWarning(null)
    setErrorMessage(null)
    setState('idle')
  }, [stopTimer, releaseStream])

  const processAudio = useCallback(
    async (blob: Blob, mimeType: string, durationSeconds: number) => {
      // The component may have been unmounted while recording (e.g. the dentist
      // navigated away). Bail out early so we never fire an API call or update
      // state on an unmounted component.
      if (!isMountedRef.current) return

      // Reset the abort flag and step counter for this new processing session.
      processingAbortedRef.current = false
      setProcessingStep(0) // "Preparando áudio…"

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
        // Also clear the step-advancement timer so it cannot fire after the
        // timeout has already surfaced the error and left the processing state.
        if (processingStepTimerRef.current) {
          clearTimeout(processingStepTimerRef.current)
          processingStepTimerRef.current = null
        }
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

      const clearStepTimer = () => {
        if (processingStepTimerRef.current) {
          clearTimeout(processingStepTimerRef.current)
          processingStepTimerRef.current = null
        }
      }

      try {
        const audioBase64 = await blobToBase64(blob)
        // Check after the async conversion — unmount or abort may have happened.
        if (!isMountedRef.current || processingAbortedRef.current) {
          clearProcessingTimeout()
          return
        }

        setProcessingStep(1) // "Enviando para análise…"

        // Dev-only: capture payload metadata so the debug panel can show it.
        // import.meta.env.DEV is false in production — Vite tree-shakes this block.
        if (import.meta.env.DEV) {
          setDebugInfo({
            mimeType,
            base64Chars: audioBase64.length,
            durationSeconds,
            blockedLocally: audioBase64.length > MAX_AUDIO_BASE64_LENGTH,
          })
        }

        // Front-end size guard — prevents a PayloadTooLargeError from the server
        // and surfaces a specific, actionable message before any network call.
        if (audioBase64.length > MAX_AUDIO_BASE64_LENGTH) {
          clearProcessingTimeout()
          if (!isMountedRef.current || processingAbortedRef.current) return
          processingAbortedRef.current = true
          const msg =
            'O áudio ficou muito grande para envio. Grave um trecho mais curto e tente novamente.'
          setErrorMessage(msg)
          setState('error')
          showAlert({ title: 'Áudio muito grande', description: msg, tone: 'error' })
          return
        }

        setProcessingStep(2) // "Transcrevendo consulta…"

        // Advance to step 3 ("Organizando…") after ~6 s to simulate the
        // transcription→classification handoff. No WebSocket required.
        processingStepTimerRef.current = setTimeout(() => {
          processingStepTimerRef.current = null
          if (!isMountedRef.current || processingAbortedRef.current) return
          setProcessingStep(3)
        }, 6_000)

        const result = await dictateClinicalRecord(recordId, {
          audioBase64,
          mimeType,
          durationSeconds: Math.max(1, Math.round(durationSeconds)),
        })
        clearStepTimer()
        // Check after the API call — unmount, reset, or timeout may have fired.
        if (!isMountedRef.current || processingAbortedRef.current) {
          clearProcessingTimeout()
          return
        }

        clearProcessingTimeout()
        setTranscript(result.transcript)
        setSuggestedFields(result.fields)
        setEditableFields({ ...result.fields })
        // Select all returned fields by default so the dentist can review and
        // unselect any they don't want to apply.
        setSelectedFieldKeys(new Set(Object.keys(result.fields) as ClinicalDictationFieldKey[]))
        // Parse odontogram suggestions from the transcript for optional tooth marking.
        const oSuggestions = parseDictationOdontogram(result.transcript)
        setOdontogramSuggestions(oSuggestions)
        setEditableOdontogramNotes(
          Object.fromEntries(oSuggestions.map((s) => [s.toothNumber, s.note]))
        )
        setSelectedOdontogramTeeth(new Set(oSuggestions.map((s) => s.toothNumber)))
        setState('success')
      } catch (err: unknown) {
        clearStepTimer()
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
    // Build field payload: use the dentist's edited values, format, skip empty.
    const toApply: Partial<Record<ClinicalDictationFieldKey, string>> = {}
    for (const [key, rawValue] of Object.entries(editableFields)) {
      if (!selectedFieldKeys.has(key as ClinicalDictationFieldKey)) continue
      const formatted = formatDictationFieldText(rawValue ?? '')
      if (!formatted) continue
      toApply[key as ClinicalDictationFieldKey] = formatted
    }

    // Build odontogram payload: selected suggestions with the dentist's notes.
    const oToApply = odontogramSuggestions
      .filter((s) => selectedOdontogramTeeth.has(s.toothNumber))
      .map((s) => ({ ...s, note: editableOdontogramNotes[s.toothNumber] ?? s.note }))

    const hasValidFields = Object.keys(toApply).length > 0
    // Odontogram suggestions are only "actionable" when the container provided the handler.
    // Without the handler, suggestions exist visually but cannot be persisted.
    const hasValidOdontogram = oToApply.length > 0 && !!onApplyOdontogram

    if (!hasValidFields && !hasValidOdontogram) {
      setApplyWarning('Nenhum campo selecionado possui conteúdo para aplicar.')
      return
    }

    if (hasValidFields) onApplyFields(toApply)
    if (hasValidOdontogram) onApplyOdontogram!(oToApply)

    showAlert({
      title: 'Sugestões aplicadas',
      description: 'Os campos foram preenchidos com o conteúdo do ditado.',
      tone: 'success',
    })
    reset()
  }, [
    editableFields,
    selectedFieldKeys,
    odontogramSuggestions,
    selectedOdontogramTeeth,
    editableOdontogramNotes,
    onApplyFields,
    onApplyOdontogram,
    showAlert,
    reset,
  ])

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

  const toggleOdontogramSelection = useCallback((toothNumber: string) => {
    setSelectedOdontogramTeeth((prev) => {
      const next = new Set(prev)
      if (next.has(toothNumber)) next.delete(toothNumber)
      else next.add(toothNumber)
      return next
    })
  }, [])

  // ── Derived values ──────────────────────────────────────────────────────────

  const fieldEntries = Object.entries(suggestedFields) as [ClinicalDictationFieldKey, string][]
  const hasFields = fieldEntries.length > 0
  const hasAnySuggestions = hasFields || odontogramSuggestions.length > 0
  const canApply = selectedFieldKeys.size > 0 || selectedOdontogramTeeth.size > 0
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
            {elapsedSeconds >= MAX_RECORDING_SECONDS - 10 && (
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
          <p className="text-sm font-medium text-foreground">
            {PROCESSING_STEPS[processingStep]}
          </p>
          {/* Progress dots — one per step, filled up to the current step */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {PROCESSING_STEPS.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-colors duration-500',
                  i <= processingStep ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {!readOnly && state === 'success' && (
        <div className="space-y-4">
          {/* Review header */}
          <div>
            <p className="text-sm font-semibold text-foreground">Revise antes de aplicar</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Edite o texto sugerido, selecione os campos corretos e aplique ao prontuário.
            </p>
          </div>

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

          {/* Field suggestions + odontogram section, or empty-field notice */}
          {hasAnySuggestions ? (
            <div className="space-y-4">
              {/* Clinical text field suggestions */}
              {hasFields && (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Campos sugeridos
                    </p>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {selectedFieldKeys.size}/{fieldEntries.length} selecionado{selectedFieldKeys.size !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ul className="space-y-2" aria-label="Selecione os campos a aplicar ao prontuário">
                    {fieldEntries.map(([key]) => {
                      const isSelected = selectedFieldKeys.has(key)
                      return (
                        <li key={key}>
                          <div
                            className={cn(
                              'rounded-lg border transition-colors',
                              isSelected
                                ? 'border-primary/25 bg-primary/5 dark:border-primary/20 dark:bg-primary/10'
                                : 'border-border bg-muted/20',
                            )}
                          >
                            <label className="flex cursor-pointer items-center gap-2.5 px-3 pt-2.5 pb-1.5">
                              <input
                                type="checkbox"
                                className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                                checked={isSelected}
                                onChange={() => {
                                  toggleFieldSelection(key)
                                  setApplyWarning(null)
                                }}
                                aria-label={`Selecionar campo ${DICTATION_FIELD_LABELS[key]}`}
                              />
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {DICTATION_FIELD_LABELS[key]}
                              </span>
                            </label>
                            <div className="px-3 pb-3">
                              <textarea
                                value={editableFields[key] ?? ''}
                                onChange={(e) => {
                                  setEditableFields((prev) => ({ ...prev, [key]: e.target.value }))
                                  setApplyWarning(null)
                                }}
                                disabled={!isSelected}
                                rows={3}
                                className={cn(
                                  'w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15',
                                  !isSelected && 'cursor-not-allowed opacity-50',
                                )}
                                aria-label={`Conteúdo sugerido para ${DICTATION_FIELD_LABELS[key]}`}
                              />
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Odontogram marking suggestions */}
              {odontogramSuggestions.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Sugestões para odontograma
                  </p>
                  <ul className="space-y-2" aria-label="Sugestões de marcação no odontograma">
                    {odontogramSuggestions.map((suggestion) => {
                      const isSelected = selectedOdontogramTeeth.has(suggestion.toothNumber)
                      return (
                        <li key={suggestion.toothNumber}>
                          <div
                            className={cn(
                              'rounded-lg border transition-colors',
                              isSelected
                                ? 'border-primary/25 bg-primary/5 dark:border-primary/20 dark:bg-primary/10'
                                : 'border-border bg-muted/20',
                            )}
                          >
                            <label className="flex cursor-pointer items-center gap-2.5 px-3 pt-2.5 pb-1.5">
                              <input
                                type="checkbox"
                                className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                                checked={isSelected}
                                onChange={() => toggleOdontogramSelection(suggestion.toothNumber)}
                                aria-label={`Selecionar dente ${suggestion.toothNumber} — ${suggestion.conditionLabel}`}
                              />
                              <span className="text-xs font-medium text-foreground">
                                Dente {suggestion.toothNumber}
                              </span>
                              <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                                {suggestion.conditionLabel}
                              </span>
                            </label>
                            <div className="px-3 pb-3">
                              <textarea
                                value={editableOdontogramNotes[suggestion.toothNumber] ?? ''}
                                onChange={(e) =>
                                  setEditableOdontogramNotes((prev) => ({
                                    ...prev,
                                    [suggestion.toothNumber]: e.target.value,
                                  }))
                                }
                                disabled={!isSelected}
                                rows={2}
                                placeholder="Observação clínica..."
                                className={cn(
                                  'w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/15',
                                  !isSelected && 'cursor-not-allowed opacity-50',
                                )}
                                aria-label={`Observação para dente ${suggestion.toothNumber}`}
                              />
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Apply warning — shown when clicked apply but no valid content */}
              {applyWarning && (
                <p
                  role="status"
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/20 dark:text-amber-300"
                >
                  {applyWarning}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  className="min-h-11 w-full"
                  onClick={handleApply}
                  disabled={!canApply}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Aplicar campos selecionados
                </Button>
                <Button
                  type="button"
                  variant="outline"
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

      {/* ── Dev debug panel ─────────────────────────────────────────────────────
          Visible only in development builds (import.meta.env.DEV === false in
          production — Vite tree-shakes this entire subtree at build time).    */}
      {import.meta.env.DEV && debugInfo !== null && (
        <div
          className="mt-4 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/30 px-3 py-2.5 text-[10px] text-muted-foreground"
          data-testid="dev-debug-panel"
        >
          <p className="mb-1.5 font-semibold uppercase tracking-wide">
            Debug — apenas em desenvolvimento
          </p>
          <p>MIME: {debugInfo.mimeType || '(browser default)'}</p>
          <p>
            Payload base64:{' '}
            ~{Math.round(debugInfo.base64Chars / 1_024)} KB
            {' '}({debugInfo.base64Chars.toLocaleString()} chars)
          </p>
          <p>Duração gravada: {debugInfo.durationSeconds.toFixed(1)} s</p>
          {debugInfo.blockedLocally && (
            <p className="mt-1 font-semibold text-red-500 dark:text-red-400">
              ⚠ Bloqueado localmente — payload excedeu o limite antes de enviar
            </p>
          )}
        </div>
      )}
    </div>
  )
}
