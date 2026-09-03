import { setBillingAccess } from '@/features/theme/billing-theme-override'
import { shouldForceLightTheme } from '@/features/theme/force-light-routes'

describe('shouldForceLightTheme', () => {
  afterEach(() => {
    setBillingAccess(null)
  })

  it('forces light on the landing page root', () => {
    expect(shouldForceLightTheme('/')).toBe(true)
  })

  it('does not force light for a non-root path that merely starts with a letter shared with a prefix', () => {
    // '/' only matches the exact root, not every other path
    expect(shouldForceLightTheme('/appzzz')).toBe(false)
  })

  it('forces light for known public marketing prefixes', () => {
    expect(shouldForceLightTheme('/planos')).toBe(true)
    expect(shouldForceLightTheme('/planos/comparar')).toBe(true)
  })

  it('does not force light for an unrelated app route', () => {
    expect(shouldForceLightTheme('/app/pacientes')).toBe(false)
  })

  it('forces light for billing routes when billing access is unknown (null)', () => {
    expect(shouldForceLightTheme('/app/assinatura')).toBe(true)
  })

  it('forces light for billing routes when billing access is explicitly false', () => {
    setBillingAccess(false)
    expect(shouldForceLightTheme('/app/assinatura')).toBe(true)
  })

  it('does not force light for billing routes when billing access is confirmed true', () => {
    setBillingAccess(true)
    expect(shouldForceLightTheme('/app/assinatura')).toBe(false)
  })

  it('matches billing sub-routes as well as the exact path', () => {
    setBillingAccess(true)
    expect(shouldForceLightTheme('/app/assinatura/sucesso')).toBe(false)
    setBillingAccess(null)
    expect(shouldForceLightTheme('/app/assinatura/sucesso')).toBe(true)
  })
})
