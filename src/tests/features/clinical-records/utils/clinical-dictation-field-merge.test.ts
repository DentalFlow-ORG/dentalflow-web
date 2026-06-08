import { mergeDictationField } from '@/features/clinical-records/utils/clinical-dictation-field-merge'

describe('mergeDictationField', () => {
  // ── Empty-field cases ─────────────────────────────────────────────────────

  it('returns the dictated text when the current field is empty', () => {
    expect(mergeDictationField('', 'Nova informação')).toBe('Nova informação')
  })

  it('returns the dictated text when the current field is whitespace-only', () => {
    expect(mergeDictationField('   ', 'Nova informação')).toBe('Nova informação')
  })

  // ── Existing-content cases ────────────────────────────────────────────────

  it('appends dictated text after two newlines when current has content', () => {
    expect(mergeDictationField('Conteúdo anterior', 'Nova informação')).toBe(
      'Conteúdo anterior\n\nNova informação',
    )
  })

  it('trims trailing whitespace from the current field before appending', () => {
    expect(mergeDictationField('Conteúdo anterior   ', 'Nova informação')).toBe(
      'Conteúdo anterior\n\nNova informação',
    )
  })

  it('trims leading whitespace from the dictated value when appending', () => {
    expect(mergeDictationField('Conteúdo anterior', '   Nova informação')).toBe(
      'Conteúdo anterior\n\nNova informação',
    )
  })

  // ── Empty dictation cases — must not damage existing content ─────────────

  it('returns the current field unchanged when dictated is empty', () => {
    expect(mergeDictationField('Conteúdo existente', '')).toBe('Conteúdo existente')
  })

  it('returns the current field unchanged when dictated is whitespace-only', () => {
    expect(mergeDictationField('Conteúdo existente', '   ')).toBe('Conteúdo existente')
  })

  // ── Both-empty edge case ──────────────────────────────────────────────────

  it('returns an empty string when both current and dictated are empty', () => {
    expect(mergeDictationField('', '')).toBe('')
  })

  // ── Multiline preservation ────────────────────────────────────────────────

  it('preserves internal newlines in the current field', () => {
    const current = 'Linha 1\nLinha 2'
    const dictated = 'Informação nova'
    expect(mergeDictationField(current, dictated)).toBe('Linha 1\nLinha 2\n\nInformação nova')
  })

  it('preserves internal newlines in the dictated value', () => {
    const current = 'Conteúdo existente'
    const dictated = 'Linha A\nLinha B'
    expect(mergeDictationField(current, dictated)).toBe('Conteúdo existente\n\nLinha A\nLinha B')
  })
})
