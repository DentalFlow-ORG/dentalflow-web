import {
  ODONTOGRAM_CONDITION_BUTTON_CLASSES,
  ODONTOGRAM_CONDITION_LABELS,
  ODONTOGRAM_CONDITION_LEGEND_CLASSES,
  ODONTOGRAM_CONDITION_OPTIONS,
} from '@/features/clinical-records/utils/odontogram-status-utils'
import { parseDictationOdontogram } from '@/features/clinical-records/utils/parse-dictation-odontogram'

// The legend, the condition buttons and the dictation parser all look a
// condition up in a map and fall back to the raw value. Those fallbacks are
// unreachable exactly as long as every declared condition has an entry — these
// contract tests are what keeps that claim honest.

describe('odontogram condition display contract', () => {
  it('labels every condition option', () => {
    for (const option of ODONTOGRAM_CONDITION_OPTIONS) {
      expect(ODONTOGRAM_CONDITION_LABELS[option.value]).toBe(option.label)
    }
  })

  it('styles every condition option in the legend', () => {
    for (const option of ODONTOGRAM_CONDITION_OPTIONS) {
      expect(ODONTOGRAM_CONDITION_LEGEND_CLASSES[option.value]).toBeTruthy()
    }
  })

  it('styles every condition option as a selectable button', () => {
    for (const option of ODONTOGRAM_CONDITION_OPTIONS) {
      expect(ODONTOGRAM_CONDITION_BUTTON_CLASSES[option.value]).toBeTruthy()
    }
  })

  it('only ever suggests conditions the odontogram can render', () => {
    const known = new Set<string>(ODONTOGRAM_CONDITION_OPTIONS.map((o) => o.value))
    const dictation = [
      'dente 11 com cárie',
      'dente 12 restaurado',
      'dente 13 com extração indicada',
      'dente 14 ausente',
      'dente 15 com coroa',
      'dente 16 tratamento de canal',
      'dente 17 com fratura',
      'dente 18 com mobilidade',
      'dente 21 com implante',
      'dente 22 com selante',
      'dente 23 monitorar',
    ].join('. ')

    const suggestions = parseDictationOdontogram(dictation)
    expect(suggestions.length).toBeGreaterThan(0)
    for (const suggestion of suggestions) {
      expect(known.has(suggestion.condition)).toBe(true)
      expect(suggestion.conditionLabel).toBe(ODONTOGRAM_CONDITION_LABELS[suggestion.condition])
    }
  })
})
