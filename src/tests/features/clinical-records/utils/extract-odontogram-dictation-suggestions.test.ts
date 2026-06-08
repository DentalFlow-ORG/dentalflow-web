import { extractOdontogramDictationSuggestions } from '@/features/clinical-records/utils/extract-odontogram-dictation-suggestions'
import type { OdontogramDictationSuggestion } from '@/features/clinical-records/utils/extract-odontogram-dictation-suggestions'

// ── Helpers ───────────────────────────────────────────────────────────────────

function byTooth(results: OdontogramDictationSuggestion[], tooth: string) {
  return results.find((s) => s.tooth === tooth)
}

// ── Basic tooth + condition detection ────────────────────────────────────────

describe('extractOdontogramDictationSuggestions', () => {
  describe('basic detection', () => {
    it('detects "cárie no dente 36"', () => {
      const result = extractOdontogramDictationSuggestions('Há cárie no dente 36.')
      const s = byTooth(result, '36')
      expect(s).toBeDefined()
      expect(s!.condition).toBe('caries')
      expect(s!.label).toBe('Dente 36 — Cárie')
    })

    it('detects "dente 36 com cárie"', () => {
      const result = extractOdontogramDictationSuggestions('Dente 36 com cárie.')
      const s = byTooth(result, '36')
      expect(s).toBeDefined()
      expect(s!.condition).toBe('caries')
    })

    it('detects "extração indicada no dente 48"', () => {
      const result = extractOdontogramDictationSuggestions('Extração indicada no dente 48.')
      const s = byTooth(result, '48')
      expect(s).toBeDefined()
      expect(s!.condition).toBe('extraction')
      expect(s!.label).toBe('Dente 48 — Extração indicada')
    })

    it('detects "coroa no dente 11"', () => {
      const result = extractOdontogramDictationSuggestions('Coroa no dente 11.')
      const s = byTooth(result, '11')
      expect(s).toBeDefined()
      expect(s!.condition).toBe('crown')
      expect(s!.label).toBe('Dente 11 — Coroa')
    })

    it('detects "restauração no dente 21"', () => {
      const result = extractOdontogramDictationSuggestions('Restauração no dente 21.')
      const s = byTooth(result, '21')
      expect(s).toBeDefined()
      expect(s!.condition).toBe('restored')
    })

    it('detects "dente 46 ausente"', () => {
      const result = extractOdontogramDictationSuggestions('Dente 46 ausente.')
      const s = byTooth(result, '46')
      expect(s).toBeDefined()
      expect(s!.condition).toBe('absent')
    })

    it('detects "ausência do dente 46" (noun form — QA checklist phrase)', () => {
      const result = extractOdontogramDictationSuggestions('Ausência do dente 46.')
      const s = byTooth(result, '46')
      expect(s).toBeDefined()
      expect(s!.condition).toBe('absent')
      expect(s!.label).toBe('Dente 46 — Ausente')
    })

    it('detects "exodontia" as extraction (clinical synonym)', () => {
      const result = extractOdontogramDictationSuggestions('Exodontia do dente 38.')
      const s = byTooth(result, '38')
      expect(s).toBeDefined()
      expect(s!.condition).toBe('extraction')
    })

    it('detects "hígido" as healthy (formal clinical term)', () => {
      const result = extractOdontogramDictationSuggestions('Dente 11 hígido.')
      const s = byTooth(result, '11')
      expect(s).toBeDefined()
      expect(s!.condition).toBe('healthy')
    })
  })

  // ── Multiple teeth ────────────────────────────────────────────────────────────

  describe('multiple teeth', () => {
    it('detects "cárie nos dentes 36 e 37"', () => {
      const result = extractOdontogramDictationSuggestions('Cárie nos dentes 36 e 37.')
      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(byTooth(result, '36')?.condition).toBe('caries')
      expect(byTooth(result, '37')?.condition).toBe('caries')
    })

    it('handles multiple sentences with different teeth and conditions', () => {
      const transcript = 'Dente 36 com cárie. Dente 11 com coroa.'
      const result = extractOdontogramDictationSuggestions(transcript)
      expect(byTooth(result, '36')?.condition).toBe('caries')
      expect(byTooth(result, '11')?.condition).toBe('crown')
    })
  })

  // ── Vague text — no suggestions ───────────────────────────────────────────────

  describe('no suggestions from vague text', () => {
    it('returns empty array for transcript with no tooth numbers', () => {
      const result = extractOdontogramDictationSuggestions(
        'Paciente relata dor difusa sem localização específica.',
      )
      expect(result).toHaveLength(0)
    })

    it('returns empty array for transcript with tooth number but no condition', () => {
      const result = extractOdontogramDictationSuggestions(
        'Examinei o dente 36 e não encontrei nada relevante.',
      )
      expect(result).toHaveLength(0)
    })

    it('returns empty array for empty transcript', () => {
      expect(extractOdontogramDictationSuggestions('')).toHaveLength(0)
    })

    it('returns empty array for whitespace-only transcript', () => {
      expect(extractOdontogramDictationSuggestions('   ')).toHaveLength(0)
    })
  })

  // ── Label format ──────────────────────────────────────────────────────────────

  describe('label format', () => {
    it('label contains "Dente N — ConditionLabel" format', () => {
      const result = extractOdontogramDictationSuggestions('Dente 36 com cárie.')
      expect(result[0]?.label).toMatch(/^Dente \d+ — .+$/)
    })

    it('tooth field is a string tooth number matching the transcript', () => {
      const result = extractOdontogramDictationSuggestions('Dente 36 com cárie.')
      expect(result[0]?.tooth).toBe('36')
      expect(typeof result[0]?.tooth).toBe('string')
    })
  })

  // ── Deduplication ─────────────────────────────────────────────────────────────

  describe('deduplication', () => {
    it('deduplicates the same tooth mentioned twice — first mention wins', () => {
      const result = extractOdontogramDictationSuggestions(
        'Dente 36 com cárie. Dente 36 com coroa.',
      )
      const teeth36 = result.filter((s) => s.tooth === '36')
      expect(teeth36).toHaveLength(1)
      expect(teeth36[0].condition).toBe('caries') // first mention
    })
  })

  // ── Valid FDI tooth numbers only ──────────────────────────────────────────────

  describe('FDI validation', () => {
    it('accepts deciduous teeth (e.g. 75)', () => {
      const result = extractOdontogramDictationSuggestions('Dente 75 com cárie.')
      expect(byTooth(result, '75')?.condition).toBe('caries')
    })

    it('ignores tooth numbers outside the valid FDI set (e.g. 99)', () => {
      const result = extractOdontogramDictationSuggestions('Dente 99 com cárie.')
      expect(result).toHaveLength(0)
    })

    it('ignores 3-digit numbers that are not valid teeth (e.g. 500 from "500mg")', () => {
      const result = extractOdontogramDictationSuggestions(
        'Prescrito amoxicilina 500mg com cárie não faz sentido.',
      )
      // 500 is 3 digits, not a valid 2-digit FDI number
      expect(result).toHaveLength(0)
    })
  })
})
