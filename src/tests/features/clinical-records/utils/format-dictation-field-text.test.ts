import { formatDictationFieldText } from '@/features/clinical-records/utils/format-dictation-field-text'

describe('formatDictationFieldText', () => {

  // ── Whitespace trimming ──────────────────────────────────────────────────────

  it('trims leading whitespace', () => {
    expect(formatDictationFieldText('  paciente relata dor')).toBe('Paciente relata dor')
  })

  it('trims trailing whitespace', () => {
    expect(formatDictationFieldText('paciente relata dor  ')).toBe('Paciente relata dor')
  })

  it('trims both sides', () => {
    expect(formatDictationFieldText('  sensibilidade ao frio  ')).toBe('Sensibilidade ao frio')
  })

  // ── First alphabetical character uppercased ──────────────────────────────────

  it('uppercases the first lowercase letter when the string starts with a letter', () => {
    expect(formatDictationFieldText('paciente relata dor no dente 36.')).toBe(
      'Paciente relata dor no dente 36.',
    )
  })

  it('does not modify the rest of the string when uppercasing the first character', () => {
    expect(formatDictationFieldText('paciente relata dor')).toBe('Paciente relata dor')
    // Only 'p' should change — the rest remains lowercase
    expect(formatDictationFieldText('paciente relata dor')[1]).toBe('a')
  })

  it('uppercases the first alphabetical character when text starts with a number', () => {
    // "36 com cárie" — first letter is 'c' at position 3
    expect(formatDictationFieldText('36 com cárie')).toBe('36 Com cárie')
  })

  it('uppercases the first alphabetical character when text starts with multiple numbers and spaces', () => {
    // First alphabetical char in "11 e 21 apresentam mobilidade" is 'e' (the conjunction)
    expect(formatDictationFieldText('11 e 21 apresentam mobilidade')).toBe(
      '11 E 21 apresentam mobilidade',
    )
  })

  // ── Existing uppercase preserved ─────────────────────────────────────────────

  it('does not change text that already starts with an uppercase letter', () => {
    expect(formatDictationFieldText('ATM sem alterações')).toBe('ATM sem alterações')
  })

  it('preserves acronyms in the middle of the string', () => {
    expect(formatDictationFieldText('paciente usa AAS diariamente')).toBe(
      'Paciente usa AAS diariamente',
    )
  })

  it('preserves medication names with uppercase (e.g. Amoxicilina)', () => {
    expect(formatDictationFieldText('amoxicilina 500mg 8/8h')).toBe('Amoxicilina 500mg 8/8h')
  })

  // ── Accented characters ──────────────────────────────────────────────────────

  it('uppercases the first accented lowercase letter', () => {
    expect(formatDictationFieldText('área de 36')).toBe('Área de 36')
  })

  // ── Edge cases ───────────────────────────────────────────────────────────────

  it('returns empty string for empty input', () => {
    expect(formatDictationFieldText('')).toBe('')
  })

  it('returns empty string for whitespace-only input', () => {
    expect(formatDictationFieldText('   ')).toBe('')
  })

  it('returns the string unchanged when it contains no alphabetical characters', () => {
    expect(formatDictationFieldText('123 456')).toBe('123 456')
  })

  it('handles a single letter', () => {
    expect(formatDictationFieldText('a')).toBe('A')
  })

  it('handles a single uppercase letter unchanged', () => {
    expect(formatDictationFieldText('A')).toBe('A')
  })

  // ── Does not double-uppercase ────────────────────────────────────────────────

  it('does not change a string that is already correctly formatted', () => {
    const text = 'Paciente relata dor no dente 36.'
    expect(formatDictationFieldText(text)).toBe(text)
  })

  // ── Blank line collapsing ─────────────────────────────────────────────────────

  it('collapses 3+ consecutive newlines to exactly two newlines', () => {
    const input = 'Primeira linha.\n\n\nSegunda linha.'
    expect(formatDictationFieldText(input)).toBe('Primeira linha.\n\nSegunda linha.')
  })

  it('collapses 4+ consecutive newlines to exactly two newlines', () => {
    const input = 'Linha A.\n\n\n\nLinha B.'
    expect(formatDictationFieldText(input)).toBe('Linha A.\n\nLinha B.')
  })

  it('does not collapse a single newline (preserves line breaks)', () => {
    const input = 'Linha A.\nLinha B.'
    expect(formatDictationFieldText(input)).toBe('Linha A.\nLinha B.')
  })

  it('does not collapse two newlines (preserves paragraph breaks)', () => {
    const input = 'Parágrafo 1.\n\nParágrafo 2.'
    expect(formatDictationFieldText(input)).toBe('Parágrafo 1.\n\nParágrafo 2.')
  })

  it('applies uppercase after collapsing blank lines', () => {
    const input = '\n\npaciente relata dor.\n\n\nEvolução estável.'
    expect(formatDictationFieldText(input)).toBe('Paciente relata dor.\n\nEvolução estável.')
  })

  // ── Preservation of clinical patterns ────────────────────────────────────────

  it('preserves FDI tooth numbers in the middle of text', () => {
    expect(formatDictationFieldText('dente 36 com cárie')).toContain('36')
    expect(formatDictationFieldText('dentes 11 e 21 normais')).toContain('11')
    expect(formatDictationFieldText('dentes 11 e 21 normais')).toContain('21')
  })

  it('preserves medication patterns like dosage and frequency', () => {
    const text = 'amoxicilina 500mg 8/8h por 7 dias'
    const result = formatDictationFieldText(text)
    expect(result).toContain('500mg')
    expect(result).toContain('8/8h')
    expect(result).toContain('7 dias')
  })

  it('example from spec: trims and capitalizes a typical dictation sentence', () => {
    const input = ' paciente relata dor no dente 36 há três dias. '
    expect(formatDictationFieldText(input)).toBe('Paciente relata dor no dente 36 há três dias.')
  })
})
