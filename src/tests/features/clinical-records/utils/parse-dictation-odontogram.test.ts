import { parseDictationOdontogram } from '@/features/clinical-records/utils/parse-dictation-odontogram'

describe('parseDictationOdontogram', () => {

  // ── Basic tooth + condition detection ────────────────────────────────────────

  it('"dente 36 com cárie" → tooth 36, caries', () => {
    const result = parseDictationOdontogram('Dente 36 com cárie.')
    expect(result).toHaveLength(1)
    expect(result[0].toothNumber).toBe('36')
    expect(result[0].condition).toBe('caries')
    expect(result[0].conditionLabel).toBe('Cárie')
  })

  it('"36 apresenta carie profunda" → tooth 36, caries', () => {
    const result = parseDictationOdontogram('36 apresenta carie profunda.')
    expect(result).toHaveLength(1)
    expect(result[0].toothNumber).toBe('36')
    expect(result[0].condition).toBe('caries')
  })

  it('"dente 11 com coroa" → tooth 11, crown', () => {
    const result = parseDictationOdontogram('Dente 11 com coroa.')
    expect(result).toHaveLength(1)
    expect(result[0].toothNumber).toBe('11')
    expect(result[0].condition).toBe('crown')
    expect(result[0].conditionLabel).toBe('Coroa')
  })

  it('"dente 75 com cárie" → deciduous tooth 75, caries', () => {
    const result = parseDictationOdontogram('Dente 75 com cárie.')
    expect(result).toHaveLength(1)
    expect(result[0].toothNumber).toBe('75')
    expect(result[0].condition).toBe('caries')
  })

  // ── Other conditions ──────────────────────────────────────────────────────────

  it('detects restoration', () => {
    const result = parseDictationOdontogram('Dente 16 restaurado.')
    expect(result[0]?.condition).toBe('restored')
  })

  it('detects extraction indication', () => {
    const result = parseDictationOdontogram('Dente 48 com extração indicada.')
    expect(result[0]?.condition).toBe('extraction')
  })

  it('detects absent tooth', () => {
    const result = parseDictationOdontogram('Dente 46 ausente.')
    expect(result[0]?.condition).toBe('absent')
  })

  it('detects endodontic treatment', () => {
    const result = parseDictationOdontogram('Dente 36 com canal.')
    expect(result[0]?.condition).toBe('endodontic')
  })

  it('detects fracture', () => {
    const result = parseDictationOdontogram('Dente 21 com fratura.')
    expect(result[0]?.condition).toBe('fracture')
  })

  // ── Unsupported / out-of-range tooth numbers ─────────────────────────────────

  it('ignores tooth number not in the valid FDI set (e.g. 99)', () => {
    const result = parseDictationOdontogram('Dente 99 com cárie.')
    expect(result).toHaveLength(0)
  })

  it('ignores tooth number 10 (not in valid set)', () => {
    const result = parseDictationOdontogram('Dente 10 com cárie.')
    expect(result).toHaveLength(0)
  })

  it('ignores tooth number 50 (not in valid set)', () => {
    const result = parseDictationOdontogram('Dente 50 com cárie.')
    expect(result).toHaveLength(0)
  })

  // ── Unknown condition ────────────────────────────────────────────────────────

  it('ignores segment with valid tooth number but unknown condition', () => {
    const result = parseDictationOdontogram('Dente 36 com problema.')
    expect(result).toHaveLength(0)
  })

  it('ignores segment with no condition keyword at all', () => {
    const result = parseDictationOdontogram('Paciente de 36 anos.')
    expect(result).toHaveLength(0)
  })

  // ── Multiple teeth in one sentence ───────────────────────────────────────────

  it('detects multiple tooth numbers in the same sentence', () => {
    const result = parseDictationOdontogram('Dentes 36 e 46 com cárie.')
    const teeth = result.map((s) => s.toothNumber).sort()
    expect(teeth).toContain('36')
    expect(teeth).toContain('46')
    // Both get the same condition from the same segment
    for (const s of result) expect(s.condition).toBe('caries')
  })

  // ── Multiple sentences ────────────────────────────────────────────────────────

  it('processes multiple sentences and returns one suggestion per tooth', () => {
    const result = parseDictationOdontogram(
      'Dente 36 com cárie. Dente 11 com coroa.',
    )
    const conditions = Object.fromEntries(result.map((s) => [s.toothNumber, s.condition]))
    expect(conditions['36']).toBe('caries')
    expect(conditions['11']).toBe('crown')
  })

  it('first mention of a tooth wins when the same tooth appears twice', () => {
    const result = parseDictationOdontogram(
      'Dente 36 com cárie. Dente 36 com coroa.',
    )
    expect(result).toHaveLength(1)
    expect(result[0].condition).toBe('caries') // first mention
  })

  // ── No false positives from numbers in dosage / age contexts ─────────────────

  it('does not match 3-digit dosage numbers (e.g. 500mg)', () => {
    const result = parseDictationOdontogram('Amoxicilina 500mg com cárie não faz sentido.')
    // 500 is not in valid tooth set, no 2-digit tooth number present
    expect(result).toHaveLength(0)
  })

  it('does not match isolated age references with no condition in same segment', () => {
    // "35 anos" — 35 not in valid tooth set; no condition keyword
    const result = parseDictationOdontogram('Paciente de 35 anos.')
    expect(result).toHaveLength(0)
  })

  // ── Edge cases ───────────────────────────────────────────────────────────────

  it('returns empty array for empty transcript', () => {
    expect(parseDictationOdontogram('')).toHaveLength(0)
  })

  it('returns empty array for whitespace-only transcript', () => {
    expect(parseDictationOdontogram('   ')).toHaveLength(0)
  })

  it('returns empty array for transcript with no teeth and no conditions', () => {
    expect(parseDictationOdontogram('Paciente em bom estado geral.')).toHaveLength(0)
  })

  // ── Note content ──────────────────────────────────────────────────────────────

  it('includes the condition label in the generated note', () => {
    const result = parseDictationOdontogram('Dente 36 com cárie.')
    expect(result[0].note).toContain('Cárie')
  })

  it('includes conditionLabel matching the condition value', () => {
    const result = parseDictationOdontogram('Dente 16 restaurado.')
    expect(result[0].conditionLabel).toBe('Restaurado')
  })
})
