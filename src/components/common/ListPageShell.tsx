import type { ReactNode } from 'react'

import { InlineFeedback } from './InlineFeedback'
import { LoadingCard } from './LoadingCard'

type ListPageShellProps = {
  isLoading: boolean
  loadingMessage?: string
  error?: string | null
  onRetry?: () => void
  isEmpty?: boolean
  emptyState?: ReactNode
  children: ReactNode
}

export function ListPageShell({
  isLoading,
  loadingMessage = 'Carregando...',
  error,
  onRetry,
  isEmpty = false,
  emptyState,
  children,
}: ListPageShellProps) {
  return (
    <>
      {error && !isLoading && (
        <InlineFeedback>
          {error}
          {onRetry && (
            <>
              {' '}
              <button
                type="button"
                className="underline underline-offset-2 hover:opacity-80"
                onClick={onRetry}
              >
                Tentar novamente
              </button>
            </>
          )}
        </InlineFeedback>
      )}
      {isLoading ? (
        <LoadingCard message={loadingMessage} />
      ) : isEmpty && emptyState ? (
        emptyState
      ) : (
        children
      )}
    </>
  )
}
