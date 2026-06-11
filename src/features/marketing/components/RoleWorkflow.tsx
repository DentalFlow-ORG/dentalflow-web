import { cn } from '@/lib/utils'

import type { RoleWorkflowStep } from '../data/public-content'

type RoleWorkflowProps = {
  workflow: RoleWorkflowStep[]
  roleLabel: string
}

export function RoleWorkflow({ workflow, roleLabel }: RoleWorkflowProps) {
  return (
    <section className="bg-slate-50 py-14 lg:py-16" aria-labelledby="workflow-heading">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Na prática</p>
        <h2 id="workflow-heading" className="mt-2 text-xl font-semibold text-slate-900">
          Um dia com o DentalFlow para{' '}
          <span className="text-primary">{roleLabel.toLowerCase()}</span>
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflow.map((step, idx) => {
            const StepIcon = step.icon
            return (
              <div
                key={step.step}
                className={cn(
                  'rounded-xl border p-5',
                  idx === 0
                    ? 'border-primary/20 bg-primary/5'
                    : 'border-slate-200 bg-white shadow-sm',
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {step.step}
                </span>
                <div className="mt-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <StepIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-800">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
