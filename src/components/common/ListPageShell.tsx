import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'

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
              <Button
                type="button"
                variant="ghost"
                className="h-auto p-0 text-sm font-normal underline underline-offset-2 hover:bg-transparent hover:opacity-80"
                onClick={onRetry}
              >
                Tentar novamente
              </Button>
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
