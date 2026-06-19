/**
 * Merges a dictated suggestion into an existing clinical record field value.
 *
 * Rules:
 * - If `dictated` is empty or whitespace-only, `current` is returned unchanged.
 * - If `current` is empty or whitespace-only, the trimmed `dictated` value is returned.
 * - Otherwise the trimmed values are joined with two newlines, preventing duplicate
 *   blank lines that would appear if either side had trailing/leading whitespace.
 */
export function mergeDictationField(current: string, dictated: string): string {
  const trimmedDictated = dictated.trim()
  if (!trimmedDictated) return current

  const trimmedCurrent = current.trim()
  if (!trimmedCurrent) return trimmedDictated

  return `${trimmedCurrent}\n\n${trimmedDictated}`
}
