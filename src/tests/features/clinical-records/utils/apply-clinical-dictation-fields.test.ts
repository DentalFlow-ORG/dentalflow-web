import { applyDictationFields } from '@/features/clinical-records/utils/apply-clinical-dictation-fields'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convenience: build a current-values map from a plain object. */
function cv(values: Record<string, string> = {}): Record<string, string> {
  return values
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('applyDictationFields', () => {
  // ── 1. Single-field application ─────────────────────────────────────────────

  it('sets dictated text when the current field is empty', () => {
    const { draftPatch } = applyDictationFields({ chiefComplaint: 'Dor no dente 36' }, cv())
    expect(draftPatch.chiefComplaint).toBe('Dor no dente 36')
  })

  it('trims leading/trailing whitespace from the dictated value', () => {
    const { draftPatch } = applyDictationFields(
      { chiefComplaint: '  Sensibilidade ao frio  ' },
      cv(),
    )
    expect(draftPatch.chiefComplaint).toBe('Sensibilidade ao frio')
  })

  // ── 2. Merge into existing content ──────────────────────────────────────────

  it('appends dictated text after two newlines when the field already has content', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: 'Nova observação' },
      cv({ clinicalEvolution: 'Observação anterior' }),
    )
    expect(draftPatch.clinicalEvolution).toBe('Observação anterior\n\nNova observação')
  })

  it('replaces whitespace-only existing content with the dictated value', () => {
    const { draftPatch } = applyDictationFields({ anamnesis: 'HAS, DM2' }, cv({ anamnesis: '   ' }))
    expect(draftPatch.anamnesis).toBe('HAS, DM2')
  })

  // ── 3. Multiple fields ───────────────────────────────────────────────────────

  it('patches multiple fields at once, each merged independently', () => {
    const { draftPatch } = applyDictationFields(
      { chiefComplaint: 'Dor', anamnesis: 'Sem alergias' },
      cv(),
    )
    expect(draftPatch.chiefComplaint).toBe('Dor')
    expect(draftPatch.anamnesis).toBe('Sem alergias')
    expect(Object.keys(draftPatch)).toHaveLength(2)
  })

  it('merges each field independently when some have existing content', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: 'Adicional', diagnosis: 'Cárie' },
      cv({ clinicalEvolution: 'Base' }),
    )
    expect(draftPatch.clinicalEvolution).toBe('Base\n\nAdicional')
    expect(draftPatch.diagnosis).toBe('Cárie')
  })

  // ── 4. Empty / invalid values are ignored ───────────────────────────────────

  it('does not include empty dictation values in the draft patch', () => {
    const { draftPatch } = applyDictationFields({ chiefComplaint: '', diagnosis: 'Cárie' }, cv())
    expect(draftPatch).not.toHaveProperty('chiefComplaint')
    expect(draftPatch.diagnosis).toBe('Cárie')
  })

  it('does not include whitespace-only dictation values in the draft patch', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: '   ', treatmentPlan: 'Restauração' },
      cv(),
    )
    expect(draftPatch).not.toHaveProperty('clinicalEvolution')
    expect(draftPatch.treatmentPlan).toBe('Restauração')
  })

  // ── 5. No-op case ────────────────────────────────────────────────────────────

  it('returns an empty patch and null section when dictationFields is empty', () => {
    const { draftPatch, targetSection } = applyDictationFields({}, cv())
    expect(Object.keys(draftPatch)).toHaveLength(0)
    expect(targetSection).toBeNull()
  })

  it('returns an empty patch when all dictation values are empty/whitespace', () => {
    const { draftPatch } = applyDictationFields(
      { chiefComplaint: '', anamnesis: '  ', clinicalEvolution: '' },
      cv(),
    )
    expect(Object.keys(draftPatch)).toHaveLength(0)
  })

  // ── 6. Section targeting ─────────────────────────────────────────────────────

  it('opens "evolucao" when clinicalEvolution is present', () => {
    const { targetSection } = applyDictationFields({ clinicalEvolution: 'Achados' }, cv())
    expect(targetSection).toBe('evolucao')
  })

  it('opens "anamnese" when anamnesis is present', () => {
    const { targetSection } = applyDictationFields({ anamnesis: 'HAS' }, cv())
    expect(targetSection).toBe('anamnese')
  })

  it('opens "diagnostico" when diagnosis is present', () => {
    const { targetSection } = applyDictationFields({ diagnosis: 'Cárie' }, cv())
    expect(targetSection).toBe('diagnostico')
  })

  it('opens "plano" when proceduresPerformed is present', () => {
    const { targetSection } = applyDictationFields({ proceduresPerformed: 'Restauração' }, cv())
    expect(targetSection).toBe('plano')
  })

  it('opens "plano" when treatmentPlan is present', () => {
    const { targetSection } = applyDictationFields({ treatmentPlan: 'Restaurar 36' }, cv())
    expect(targetSection).toBe('plano')
  })

  it('opens "plano" when prescription or recommendations are present', () => {
    expect(applyDictationFields({ prescription: 'Amoxicilina' }, cv()).targetSection).toBe('plano')
    expect(
      applyDictationFields({ recommendations: 'Retornar em 7 dias' }, cv()).targetSection,
    ).toBe('plano')
  })

  it('clinicalEvolution takes priority over anamnesis in section targeting', () => {
    const { targetSection } = applyDictationFields(
      { anamnesis: 'HAS', clinicalEvolution: 'Achados' },
      cv(),
    )
    expect(targetSection).toBe('evolucao')
  })

  it('does not open any section for chiefComplaint (always-visible field)', () => {
    const { targetSection } = applyDictationFields({ chiefComplaint: 'Dor' }, cv())
    expect(targetSection).toBeNull()
  })

  it('does not open any section for privateNotes (always-visible field)', () => {
    const { targetSection } = applyDictationFields({ privateNotes: 'Observação' }, cv())
    expect(targetSection).toBeNull()
  })

  // ── 7. Per-field apply modes ─────────────────────────────────────────────────

  it('replace mode sets the value directly without merging with existing content', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: 'Texto novo' },
      cv({ clinicalEvolution: 'Conteúdo anterior' }),
      { clinicalEvolution: 'replace' },
    )
    expect(draftPatch.clinicalEvolution).toBe('Texto novo')
  })

  it('append mode (explicit) still merges with existing content', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: 'Texto novo' },
      cv({ clinicalEvolution: 'Conteúdo anterior' }),
      { clinicalEvolution: 'append' },
    )
    expect(draftPatch.clinicalEvolution).toBe('Conteúdo anterior\n\nTexto novo')
  })

  it('missing mode defaults to append (same as before)', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: 'Texto novo' },
      cv({ clinicalEvolution: 'Conteúdo anterior' }),
      // no modes provided
    )
    expect(draftPatch.clinicalEvolution).toBe('Conteúdo anterior\n\nTexto novo')
  })

  it('mixed modes — different fields use independent modes', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: 'Evolução nova', anamnesis: 'Anamnese nova' },
      cv({ clinicalEvolution: 'Evolução antiga', anamnesis: 'Anamnese antiga' }),
      { clinicalEvolution: 'replace', anamnesis: 'append' },
    )
    expect(draftPatch.clinicalEvolution).toBe('Evolução nova')
    expect(draftPatch.anamnesis).toBe('Anamnese antiga\n\nAnamnese nova')
  })

  it('replace mode with empty dictation value is still excluded from the patch', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: '' },
      cv({ clinicalEvolution: 'Conteúdo anterior' }),
      { clinicalEvolution: 'replace' },
    )
    expect(draftPatch).not.toHaveProperty('clinicalEvolution')
  })

  it('replace mode trims the dictation value', () => {
    const { draftPatch } = applyDictationFields(
      { diagnosis: '  Cárie profunda  ' },
      cv({ diagnosis: 'Achado anterior' }),
      { diagnosis: 'replace' },
    )
    expect(draftPatch.diagnosis).toBe('Cárie profunda')
  })

  it('replace mode on an empty field produces the trimmed value (no merging needed)', () => {
    const { draftPatch } = applyDictationFields(
      { chiefComplaint: 'Dor no dente 36' },
      cv({ chiefComplaint: '' }),
      { chiefComplaint: 'replace' },
    )
    expect(draftPatch.chiefComplaint).toBe('Dor no dente 36')
  })

  it('edit mode applies the value directly (same mechanics as replace)', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: 'Conteúdo anterior\n\nTexto editado' },
      cv({ clinicalEvolution: 'Conteúdo anterior' }),
      { clinicalEvolution: 'edit' },
    )
    expect(draftPatch.clinicalEvolution).toBe('Conteúdo anterior\n\nTexto editado')
  })

  it('edit mode does not re-merge — the textarea value is the final value', () => {
    const { draftPatch } = applyDictationFields(
      { anamnesis: 'Texto customizado pelo dentista' },
      cv({ anamnesis: 'Conteúdo original' }),
      { anamnesis: 'edit' },
    )
    // Must not produce "Conteúdo original\n\nTexto customizado pelo dentista"
    expect(draftPatch.anamnesis).toBe('Texto customizado pelo dentista')
  })

  it('edit mode with empty textarea value is still excluded from the patch', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: '' },
      cv({ clinicalEvolution: 'Conteúdo anterior' }),
      { clinicalEvolution: 'edit' },
    )
    expect(draftPatch).not.toHaveProperty('clinicalEvolution')
  })

  it('edit mode trims the textarea value', () => {
    const { draftPatch } = applyDictationFields(
      { diagnosis: '  Texto editado  ' },
      cv({ diagnosis: 'Diagnóstico existente' }),
      { diagnosis: 'edit' },
    )
    expect(draftPatch.diagnosis).toBe('Texto editado')
  })

  it('mixed modes including edit — each field uses its own mode independently', () => {
    const { draftPatch } = applyDictationFields(
      {
        clinicalEvolution: 'Conteúdo anterior\n\nIA gerado',
        anamnesis: 'Texto novo',
        diagnosis: 'Diagnóstico novo',
      },
      cv({
        clinicalEvolution: 'Conteúdo anterior',
        anamnesis: 'Anamnese anterior',
        diagnosis: 'Diagnóstico anterior',
      }),
      {
        clinicalEvolution: 'edit',
        anamnesis: 'append',
        diagnosis: 'replace',
      },
    )
    expect(draftPatch.clinicalEvolution).toBe('Conteúdo anterior\n\nIA gerado')
    expect(draftPatch.anamnesis).toBe('Anamnese anterior\n\nTexto novo')
    expect(draftPatch.diagnosis).toBe('Diagnóstico novo')
  })

  // ── 8. Autosave / dirty-guard contract ──────────────────────────────────────
  // When draftPatch is non-empty, the container calls setField() for each entry,
  // which updates the React draft state. This makes isDirty=true, activating
  // useUnsavedChangesGuard and triggering autosave — no bypass occurs.

  it('produces a non-empty draftPatch for valid fields, confirming the normal autosave pipeline is triggered', () => {
    const { draftPatch } = applyDictationFields(
      { clinicalEvolution: 'Sensibilidade ao frio' },
      cv({ clinicalEvolution: '' }),
    )
    expect(Object.keys(draftPatch).length).toBeGreaterThan(0)
  })

  it('produces an empty draftPatch for all-empty input, so no spurious draft dirtying occurs', () => {
    const { draftPatch } = applyDictationFields({ chiefComplaint: '', clinicalEvolution: '' }, cv())
    expect(Object.keys(draftPatch)).toHaveLength(0)
  })
})
