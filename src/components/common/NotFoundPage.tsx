import { Link } from '@tanstack/react-router'

/**
 * Shown for any unmatched route.
 *
 * TanStack Router's built-in fallback renders a bare English "Not Found" with
 * no layout and no way back, which on a Portuguese product reads as a broken
 * page rather than a wrong address.
 */
export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground">Erro 404</p>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Página não encontrada
        </h1>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          O endereço acessado não existe ou foi movido. Verifique o link ou volte para continuar
          navegando.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Voltar ao início
        </Link>
        <Link
          to="/acessar"
          search={{ mode: 'login' }}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground"
        >
          Acessar a plataforma
        </Link>
      </div>
    </main>
  )
}
