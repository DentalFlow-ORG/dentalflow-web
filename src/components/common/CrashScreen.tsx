import { AlertTriangle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function CrashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Algo deu errado
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          Ocorreu um erro inesperado na aplicação. Tente recarregar a página. Se
          o problema persistir, entre em contato com o suporte.
        </p>
      </div>
      <Button onClick={() => window.location.reload()}>
        <RefreshCw className="h-4 w-4" />
        Recarregar página
      </Button>
    </div>
  )
}
