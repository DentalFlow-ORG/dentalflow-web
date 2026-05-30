import { Crown, Gem, Rocket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const PLAN_TAGLINES: Record<string, string> = {
  starter: 'Para organizar sua operação sem complexidade.',
  professional: 'Para clínicas que querem crescer com mais controle e previsibilidade.',
  premium: 'Para clínicas que querem uma experiência mais completa, automatizada e premium.',
}

export const PLAN_ICONS: Record<string, LucideIcon> = {
  starter: Rocket,
  professional: Gem,
  premium: Crown,
}

export const TRIAL_LABELS: Record<string, string> = {
  starter: 'Começar com Starter',
  professional: 'Escolher Professional',
  premium: 'Ativar Premium',
}
