import { ApiError } from '@/services/http'

/**
 * Maps clinical dictation API / client failures to user-friendly Portuguese messages.
 * Never exposes raw backend messages, stack traces, or error codes to the dentist.
 *
 * Microphone-permission and unsupported-browser errors are intentionally NOT handled
 * here because they originate in the MediaRecorder flow (not the API call) and already
 * have targeted messages in VoiceDictationCard.
 */
export function getClinicalDictationErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    // ── Backend unreachable (ERR_CONNECTION_REFUSED / network error) ──────────
    // status 0 = fetch threw TypeError; the browser got no HTTP response at all.
    // In development, surface a hint so the developer knows which process to start.
    // In production the generic fallback is more appropriate for end users.
    if (err.status === 0 && import.meta.env.DEV) {
      return 'Backend inacessível. Verifique se o dentalflow-api está em execução em localhost:3000.'
    }

    // ── Plan gate / payment required ─────────────────────────────────────────
    // 402: apiRequest already redirects, but still throws ApiError
    // 403: @RequirePlanFeature blocks non-premium users
    if (err.status === 402 || err.status === 403) {
      return 'Ditado clínico disponível apenas no plano Premium.'
    }

    // ── Rate limit or monthly quota exhausted ─────────────────────────────────
    // Both the per-minute throttle (@Throttle 3/min) and the monthly quota
    // (AiQuotaService) return HTTP 429. Distinguish by the translated message:
    // quota messages contain "mensal" / "mês"; throttle messages do not.
    if (err.status === 429) {
      const lower = err.message.toLowerCase()
      if (lower.includes('mensal') || lower.includes('mês') || lower.includes('mes')) {
        return 'Limite mensal de ditados clínicos atingido para este plano.'
      }
      return 'Muitas tentativas em pouco tempo. Aguarde alguns instantes e tente novamente.'
    }

    // ── AI service unavailable ────────────────────────────────────────────────
    // 503: OPENAI_AI_ASSISTANT_ENABLED=false or OPENAI_API_KEY missing
    if (err.status === 503) {
      return 'O ditado clínico está temporariamente indisponível. Tente novamente mais tarde.'
    }

    // ── Validation failure or audio too large ─────────────────────────────────
    // 400: DTO validation (mimeType, durationSeconds, base64 format)
    // 413: request body exceeds the 2 MB route-specific limit
    if (err.status === 400 || err.status === 413) {
      return 'O áudio é muito longo ou inválido. Grave um áudio mais curto e tente novamente.'
    }
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return 'Não foi possível processar o ditado clínico agora. Tente novamente.'
}
