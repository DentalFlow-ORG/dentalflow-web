import { getToothKind } from '@/features/clinical-records/utils/odontogram-status-utils'

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
