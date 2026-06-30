import { cn } from '@/lib/utils'

import { PlanUpgradePrompt } from './PlanUpgradePrompt'

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
        <PlanUpgradePrompt
          title="Recurso Premium"
          description={
            blockedReason ?? 'O assistente de IA está disponível nos planos Professional e Premium.'
          }
        />
      </div>
    </div>
  )
}
