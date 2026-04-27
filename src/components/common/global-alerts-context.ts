import { createContext, useContext } from 'react'

export type AlertTone = 'success' | 'error' | 'warning' | 'info'

export type AlertInput = {
  title: string
  description?: string
  tone?: AlertTone
  durationMs?: number
}

export type AlertItem = Required<Omit<AlertInput, 'description'>> & {
  id: string
  description?: string
}

export type GlobalAlertsContextValue = {
  showAlert: (alert: AlertInput) => string
  dismissAlert: (id: string) => void
}

export const GlobalAlertsContext =
  createContext<GlobalAlertsContextValue | null>(null)

export function useGlobalAlerts() {
  const context = useContext(GlobalAlertsContext)

  if (!context) {
    throw new Error('useGlobalAlerts must be used inside GlobalAlertsProvider')
  }

  return context
}
