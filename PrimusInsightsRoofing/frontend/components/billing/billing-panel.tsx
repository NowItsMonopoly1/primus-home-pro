'use client'

// PRIMUS HOME PRO - Billing Panel
// Plan selection and upgrade interface

import { useTransition } from 'react'
import { User } from '@prisma/client'
import { PLANS, type PlanConfig } from '@/lib/billing/plans'
import { createCheckoutSession, createPortalSession } from '@/lib/actions/billing'
import { Check, Loader2 } from 'lucide-react'

interface BillingPanelProps {
  user: User
  currentPlan: PlanConfig
}

export function BillingPanel({ user, currentPlan }: BillingPanelProps) {
  const [isPending, startTransition] = useTransition()

  function handleUpgrade(planId: string) {
    startTransition(async () => {
      const res = await createCheckoutSession(user.id, planId)
      if (res.success && res.data) {
        window.location.href = res.data.url
      } else {
        alert(res.success ? 'Error creating checkout' : (res as any).error || 'Failed to start checkout')
      }
    })
  }

  function handleManage() {
    startTransition(async () => {
      const res = await createPortalSession(user.id)
      if (res.success && res.data) {
        window.location.href = res.data.url
      } else {
        alert(res.success ? 'Error opening portal' : (res as any).error || 'Failed to open billing portal')
      }
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLANS.map((plan) => {
        const isCurrent = currentPlan.id === plan.id
        const isFree = plan.priceMonthly === 0

        return (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-2xl border p-6 ${
              isCurrent
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card'
            }`}
          >
            {isCurrent && (
              <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-xl bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                CURRENT
              </div>
            )}

            <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
            <div className="mt-2 text-3xl font-bold text-foreground">
              ${plan.priceMonthly}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            <p className="mt-2 h-10 text-sm text-muted-foreground">{plan.description}</p>

            <div className="my-6 flex-1 space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>
                  {plan.leadLimit ? `${plan.leadLimit} Leads/mo` : 'Unlimited Leads'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>
                  {plan.automationLimit
                    ? `${plan.automationLimit} Automation${plan.automationLimit > 1 ? 's' : ''}`
                    : 'Unlimited Automations'}
                </span>
              </div>
            </div>

            {isCurrent && !isFree ? (
              <button
                onClick={handleManage}
                disabled={isPending}
                className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                Manage Subscription
              </button>
            ) : isCurrent ? (
              <button
                disabled
                className="w-full cursor-default rounded-xl bg-muted py-3 text-sm font-semibold text-muted-foreground"
              >
                Active Plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={isPending}
                className="flex w-full justify-center rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Upgrade'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
