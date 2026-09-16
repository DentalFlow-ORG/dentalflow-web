export const env = {
  get apiUrl(): string | undefined {
    return import.meta.env.VITE_API_URL as string | undefined
  },
  get billingPromotionEndsAt(): string | undefined {
    return import.meta.env.VITE_BILLING_PROMOTION_ENDS_AT as string | undefined
  },
} as const

/**
 * The API base URL, or a thrown error if it is not configured.
 *
 * Anything building a URL to the backend goes through here rather than reading
 * import.meta.env directly: an unset variable interpolates as the string
 * "undefined", which produces a URL that looks plausible and fails at the far
 * end instead of at the point of misconfiguration.
 */
export function requireApiUrl(): string {
  if (!env.apiUrl) {
    throw new Error('VITE_API_URL não está configurada.')
  }
  return env.apiUrl
}
