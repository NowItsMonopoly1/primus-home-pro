// PRIMUS HOME PRO - Billing Plans Configuration
// Source of truth for pricing and plan limits

export type SubscriptionPlan = 'free' | 'pro' | 'agency'

export interface PlanConfig {
  id: SubscriptionPlan
  name: string
  description: string
  priceMonthly: number
  stripePriceId: string
  leadLimit: number | null // null = unlimited
  automationLimit: number | null
}

export const PLANS: PlanConfig[] = [
  {
    id: 'free',
    name: 'Free Tier',
    description: 'Test the engine. Perfect for new accounts.',
    priceMonthly: 0,
    stripePriceId: '',
    leadLimit: 50,
    automationLimit: 1,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For solo operators & small teams.',
    priceMonthly: 48, // Matches your Stripe product price
    stripePriceId: process.env.STRIPE_PRICE_PRO || 'price_1SZ1ii05lmCbSdUDS1cX1OW8',
    leadLimit: 1000,
    automationLimit: null, // unlimited
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'For scaling businesses.',
    priceMonthly: 148, // Matches your Stripe product price
    stripePriceId: process.env.STRIPE_PRICE_AGENCY || 'price_1SZ1l005lmCbSdUDzc20PR2E',
    leadLimit: null, // unlimited
    automationLimit: null, // unlimited
  },
]

/**
 * Get plan configuration by ID
 */
export function getPlanConfig(id: string | null | undefined): PlanConfig {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

/**
 * Check if user has exceeded plan limits
 */
export function checkLimits(
  plan: PlanConfig,
  current: { leads: number; automations: number }
): {
  canAddLead: boolean
  canAddAutomation: boolean
  leadsRemaining: number | null
  automationsRemaining: number | null
} {
  const canAddLead = plan.leadLimit === null || current.leads < plan.leadLimit
  const canAddAutomation =
    plan.automationLimit === null || current.automations < plan.automationLimit

  const leadsRemaining =
    plan.leadLimit === null ? null : Math.max(0, plan.leadLimit - current.leads)
  const automationsRemaining =
    plan.automationLimit === null
      ? null
      : Math.max(0, plan.automationLimit - current.automations)

  return {
    canAddLead,
    canAddAutomation,
    leadsRemaining,
    automationsRemaining,
  }
}
