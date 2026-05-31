/**
 * Normalizes clinical dictation field text before applying to the record.
 *
 * Rules (conservative):
 * - Trims surrounding whitespace.
 * - Collapses runs of 3+ consecutive newlines to exactly two (one blank line between
 *   paragraphs). Two-newline paragraph breaks are preserved as-is.
 * - Uppercases the first alphabetical character (a-z, A-Z, and Latin Extended À-ÿ).
 * - Does not modify the rest of the string, preserving acronyms, medication names,
 *   tooth numbers (FDI: "36", "11", "21"), and dosage patterns ("500mg", "8/8h").
 *
 * Behavior when text starts with a non-letter (e.g. a number):
 * - "36 com cárie..." → "36 Com cárie..." (first letter 'c' is uppercased)
 * - "ATM sem alterações" → "ATM sem alterações" (A is already uppercase, unchanged)
 *
 * Empty or whitespace-only input returns an empty string.
 *
 * Example:
 *   Input:  " paciente relata dor no dente 36 há três dias. "
 *   Output: "Paciente relata dor no dente 36 há três dias."
 */
export function formatDictationFieldText(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  // Collapse 3+ consecutive newlines to two (one blank paragraph separator).
  // Single and double newlines are left untouched.
  const collapsed = trimmed.replace(/\n{3,}/g, '\n\n')
  // Replace only the first alphabetical character. Without the 'g' flag,
  // String.replace replaces exactly one occurrence — the first match.
  return collapsed.replace(/[a-zA-ZÀ-ÿ]/, (ch) => ch.toUpperCase())
}
