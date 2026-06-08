import {
  getSnapshotSummary,
  getToothKind,
  normalizeOdontogramSnapshot,
  ODONTOGRAM_CONDITION_BUTTON_CLASSES,
  ODONTOGRAM_CONDITION_LEGEND_CLASSES,
  ODONTOGRAM_CONDITION_OPTIONS,
  ODONTOGRAM_TOOTH_TOKENS,
} from '@/features/clinical-records/utils/odontogram-status-utils'

// ── getToothKind ──────────────────────────────────────────────────────────────

describe('getToothKind', () => {
  // ── Permanent dentition ─────────────────────────────────────────────────────

  it('returns incisor for permanent incisor positions (1–2)', () => {
    expect(getToothKind(11)).toBe('incisor') // upper right central
    expect(getToothKind(12)).toBe('incisor') // upper right lateral
    expect(getToothKind(41)).toBe('incisor') // lower right central
    expect(getToothKind(22)).toBe('incisor') // upper left lateral
  })

  it('returns canine for permanent canine position (3)', () => {
    expect(getToothKind(13)).toBe('canine') // upper right
    expect(getToothKind(43)).toBe('canine') // lower right
    expect(getToothKind(23)).toBe('canine') // upper left
  })

  it('returns premolar for permanent positions 4–5', () => {
    expect(getToothKind(14)).toBe('premolar') // 1st premolar
    expect(getToothKind(15)).toBe('premolar') // 2nd premolar
    expect(getToothKind(44)).toBe('premolar')
    expect(getToothKind(25)).toBe('premolar')
  })

  it('returns molar for permanent positions 6–8', () => {
    expect(getToothKind(16)).toBe('molar') // 1st molar
    expect(getToothKind(17)).toBe('molar') // 2nd molar
    expect(getToothKind(18)).toBe('molar') // 3rd molar (wisdom)
    expect(getToothKind(36)).toBe('molar')
  })

  // ── Deciduous dentition ─────────────────────────────────────────────────────

  it('returns incisor for deciduous incisor positions (1–2)', () => {
    expect(getToothKind(51)).toBe('incisor') // upper right central
    expect(getToothKind(52)).toBe('incisor') // upper right lateral
    expect(getToothKind(81)).toBe('incisor') // lower right central
    expect(getToothKind(62)).toBe('incisor') // upper left lateral
  })

  it('returns canine for deciduous canine position (3)', () => {
    expect(getToothKind(53)).toBe('canine') // upper right
    expect(getToothKind(73)).toBe('canine') // lower left
    expect(getToothKind(83)).toBe('canine') // lower right
  })

  it('returns molar (not premolar) for deciduous positions 4–5 — primary molars', () => {
    // Deciduous dentition has no premolars: positions 4–5 are primary molars
    expect(getToothKind(54)).toBe('molar') // upper right 1st primary molar
    expect(getToothKind(55)).toBe('molar') // upper right 2nd primary molar
    expect(getToothKind(84)).toBe('molar') // lower right 1st primary molar
    expect(getToothKind(85)).toBe('molar') // lower right 2nd primary molar
    expect(getToothKind(64)).toBe('molar')
    expect(getToothKind(75)).toBe('molar')
  })
})

// ── Condition catalogue completeness ─────────────────────────────────────────

describe('ODONTOGRAM_CONDITION_OPTIONS — completeness', () => {
  const allValues = ODONTOGRAM_CONDITION_OPTIONS.map((o) => o.value)

  const EXPECTED_CONDITIONS = [
    // Original 6
    'healthy', 'caries', 'restored', 'absent', 'extraction', 'crown',
    // New 7 added in Block 4
    'endodontic', 'implant', 'fracture', 'mobility', 'sealant', 'prosthetic', 'watch',
  ] as const

  it('contains exactly 13 conditions', () => {
    expect(allValues).toHaveLength(13)
  })

  it('includes every expected professional condition', () => {
    for (const cond of EXPECTED_CONDITIONS) {
      expect(allValues).toContain(cond)
    }
  })

  it('every condition has a non-empty Portuguese label', () => {
    for (const { label } of ODONTOGRAM_CONDITION_OPTIONS) {
      expect(label.trim().length).toBeGreaterThan(0)
    }
  })

  it('every condition has a visual token entry with fill and stroke', () => {
    for (const { value } of ODONTOGRAM_CONDITION_OPTIONS) {
      const token = ODONTOGRAM_TOOTH_TOKENS[value]
      expect(token).toBeDefined()
      expect(token.fill).toBeTruthy()
      expect(token.stroke).toBeTruthy()
      expect(token.text).toBeTruthy()
      expect(token.dot).toBeTruthy()
    }
  })

  it('every condition has a legend class entry (including dark mode classes)', () => {
    for (const { value } of ODONTOGRAM_CONDITION_OPTIONS) {
      const cls = ODONTOGRAM_CONDITION_LEGEND_CLASSES[value]
      expect(cls).toBeDefined()
      expect(cls.length).toBeGreaterThan(0)
      // Legend classes must have dark: variants for proper dark mode support
      expect(cls).toContain('dark:')
    }
  })

  it('every condition has a button class entry', () => {
    for (const { value } of ODONTOGRAM_CONDITION_OPTIONS) {
      const cls = ODONTOGRAM_CONDITION_BUTTON_CLASSES[value]
      expect(cls).toBeDefined()
      expect(cls.length).toBeGreaterThan(0)
    }
  })
})

// ── normalizeOdontogramSnapshot ───────────────────────────────────────────────

describe('normalizeOdontogramSnapshot', () => {
  it('returns null for null', () => {
    expect(normalizeOdontogramSnapshot(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(normalizeOdontogramSnapshot(undefined)).toBeNull()
  })

  it('returns null for a plain string', () => {
    expect(normalizeOdontogramSnapshot('not an object')).toBeNull()
  })

  it('returns null for a number', () => {
    expect(normalizeOdontogramSnapshot(42)).toBeNull()
  })

  it('returns null for an array', () => {
    // Arrays are typeof 'object' but should be rejected
    expect(normalizeOdontogramSnapshot([])).toBeNull()
    expect(normalizeOdontogramSnapshot([{ condition: 'caries' }])).toBeNull()
  })

  it('returns a valid OdontogramData for a well-formed snapshot', () => {
    const input = {
      teeth: {
        '11': { condition: 'caries', notes: 'upper right central' },
        '21': { condition: 'restored' },
      },
      notes: 'general observations',
    }
    const result = normalizeOdontogramSnapshot(input)
    expect(result).not.toBeNull()
    expect(result?.teeth['11']?.condition).toBe('caries')
    expect(result?.teeth['11']?.notes).toBe('upper right central')
    expect(result?.teeth['21']?.condition).toBe('restored')
    expect(result?.notes).toBe('general observations')
  })

  it('returns empty teeth object if the teeth key is missing', () => {
    const result = normalizeOdontogramSnapshot({ notes: 'something' })
    expect(result).not.toBeNull()
    expect(result?.teeth).toEqual({})
    expect(result?.notes).toBe('something')
  })

  it('returns empty teeth object if teeth is not a plain object', () => {
    expect(normalizeOdontogramSnapshot({ teeth: [] })?.teeth).toEqual({})
    expect(normalizeOdontogramSnapshot({ teeth: 'invalid' })?.teeth).toEqual({})
    expect(normalizeOdontogramSnapshot({ teeth: null })?.teeth).toEqual({})
  })

  it('silently drops malformed tooth entries', () => {
    const input = {
      teeth: {
        '11': 'not-an-object',   // string — invalid
        '21': null,              // null — invalid
        '31': 42,                // number — invalid
        '41': { condition: 'crown' }, // valid
      },
    }
    const result = normalizeOdontogramSnapshot(input)
    expect(result?.teeth['11']).toBeUndefined()
    expect(result?.teeth['21']).toBeUndefined()
    expect(result?.teeth['31']).toBeUndefined()
    expect(result?.teeth['41']?.condition).toBe('crown')
  })

  it('coerces non-string condition values to undefined within a valid tooth object', () => {
    const input = { teeth: { '11': { condition: 99, notes: 'valid notes' } } }
    const result = normalizeOdontogramSnapshot(input)
    expect(result?.teeth['11']?.condition).toBeUndefined()
    expect(result?.teeth['11']?.notes).toBe('valid notes')
  })

  it('omits notes when the top-level notes field is not a string', () => {
    const result = normalizeOdontogramSnapshot({ teeth: {}, notes: 42 })
    expect(result?.notes).toBeUndefined()
  })
})

// ── getSnapshotSummary ────────────────────────────────────────────────────────

describe('getSnapshotSummary', () => {
  it('returns empty array for null', () => {
    expect(getSnapshotSummary(null)).toEqual([])
  })

  it('returns empty array for undefined', () => {
    expect(getSnapshotSummary(undefined)).toEqual([])
  })

  it('returns empty array for non-object input', () => {
    expect(getSnapshotSummary('invalid')).toEqual([])
    expect(getSnapshotSummary(42)).toEqual([])
    expect(getSnapshotSummary([])).toEqual([])
  })

  it('returns empty array when snapshot has no teeth', () => {
    expect(getSnapshotSummary({ teeth: {} })).toEqual([])
  })

  it('returns empty array when all teeth are healthy (excluded from summary)', () => {
    const snapshot = {
      teeth: { '11': { condition: 'healthy' }, '21': { condition: 'healthy' } },
    }
    expect(getSnapshotSummary(snapshot)).toEqual([])
  })

  it('excludes healthy teeth from the returned summary', () => {
    const snapshot = {
      teeth: {
        '11': { condition: 'healthy' },
        '21': { condition: 'caries' },
      },
    }
    const result = getSnapshotSummary(snapshot)
    expect(result.every((r) => r.condition !== 'healthy')).toBe(true)
    expect(result).toHaveLength(1)
  })

  it('excludes teeth with no condition from the summary', () => {
    const snapshot = { teeth: { '11': {}, '21': { condition: 'crown' } } }
    const result = getSnapshotSummary(snapshot)
    expect(result).toHaveLength(1)
    expect(result[0].condition).toBe('crown')
  })

  it('counts each non-healthy condition correctly', () => {
    const snapshot = {
      teeth: {
        '11': { condition: 'caries' },
        '12': { condition: 'caries' },
        '13': { condition: 'crown' },
        '21': { condition: 'endodontic' },
        '22': { condition: 'endodontic' },
        '23': { condition: 'endodontic' },
      },
    }
    const result = getSnapshotSummary(snapshot)
    expect(result.find((r) => r.condition === 'caries')?.count).toBe(2)
    expect(result.find((r) => r.condition === 'crown')?.count).toBe(1)
    expect(result.find((r) => r.condition === 'endodontic')?.count).toBe(3)
  })

  it('sorts results by count descending', () => {
    const snapshot = {
      teeth: {
        '11': { condition: 'implant' },
        '21': { condition: 'caries' },
        '22': { condition: 'caries' },
        '23': { condition: 'caries' },
        '31': { condition: 'restored' },
        '32': { condition: 'restored' },
      },
    }
    const result = getSnapshotSummary(snapshot)
    expect(result[0].condition).toBe('caries')
    expect(result[0].count).toBe(3)
    expect(result[1].condition).toBe('restored')
    expect(result[1].count).toBe(2)
    expect(result[2].condition).toBe('implant')
    expect(result[2].count).toBe(1)
  })

  it('returns a Portuguese label for all known conditions', () => {
    const snapshot = {
      teeth: {
        '11': { condition: 'fracture' },
        '12': { condition: 'mobility' },
        '13': { condition: 'sealant' },
        '14': { condition: 'prosthetic' },
        '15': { condition: 'watch' },
      },
    }
    const result = getSnapshotSummary(snapshot)
    for (const item of result) {
      expect(item.label.trim().length).toBeGreaterThan(0)
      expect(item.label).not.toBe(item.condition) // should not fall back to raw condition key
    }
  })

  it('returns a legendClass for all known conditions', () => {
    const snapshot = {
      teeth: {
        '11': { condition: 'endodontic' },
        '21': { condition: 'implant' },
      },
    }
    const result = getSnapshotSummary(snapshot)
    for (const item of result) {
      expect(item.legendClass.trim().length).toBeGreaterThan(0)
    }
  })

  it('returns a fallback legendClass for unknown/unknown-future conditions', () => {
    const snapshot = { teeth: { '11': { condition: 'future-condition-unknown' } } }
    const result = getSnapshotSummary(snapshot)
    expect(result[0].legendClass).toBe('border-border bg-card text-muted-foreground')
  })
})
