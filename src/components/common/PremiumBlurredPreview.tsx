import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Lock, Sparkles } from 'lucide-react'

const FAKE_SECTIONS = [{ w: 'w-3/4' }, { w: 'w-full' }, { w: 'w-5/6' }, { w: 'w-2/3' }]

function SkeletonCard({ w }: { w: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted p-4">
      <div className="mb-2 h-3.5 w-1/3 rounded bg-border" />
      <div className={cn('h-3 rounded bg-border/70', w)} />
      <div className="mt-1.5 h-3 w-1/2 rounded bg-border/50" />
    </div>
  )
}

export function PremiumBlurredPreview({ blockedReason }: { blockedReason: string | null }) {
  return (
    <div className="relative">
      {/* Blurred skeleton grid */}
      <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
        <div className="grid gap-3 sm:grid-cols-2">
          {FAKE_SECTIONS.map((s) => (
            <SkeletonCard key={s.w} w={s.w} />
          ))}
        </div>
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-background/80 px-6 text-center backdrop-blur-[2px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
          <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Recurso Premium</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {blockedReason ??
              'O assistente de IA está disponível nos planos Professional e Premium.'}
          </p>
        </div>
        <Button size="sm" asChild>
          <a href="/app/assinatura">
            <Sparkles className="h-3.5 w-3.5" />
            Ver planos
          </a>
        </Button>
      </div>
    </div>
  )
}
