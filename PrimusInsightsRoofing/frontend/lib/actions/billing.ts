'use server'

// PRIMUS HOME PRO - Billing Actions
// Server actions for Stripe checkout and portal

import { stripe } from '@/lib/billing/stripe'
import { prisma } from '@/lib/db/prisma'
import { PLANS } from '@/lib/billing/plans'
import type { ActionResponse } from '@/types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Create Stripe checkout session for plan upgrade
 */
export async function createCheckoutSession(
  userId: string,
  planId: string
): Promise<ActionResponse<{ url: string }>> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.email) {
      return { success: false, error: 'User not found' }
    }

    const plan = PLANS.find((p) => p.id === planId)
    if (!plan || !plan.stripePriceId || plan.priceMonthly === 0) {
      return { success: false, error: 'Invalid plan' }
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomer: customerId },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      metadata: { userId: user.id, planId: plan.id },
      success_url: `${APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${APP_URL}/dashboard/billing?canceled=true`,
    })

    if (!session.url) {
      return { success: false, error: 'Failed to create checkout session' }
    }

    return { success: true, data: { url: session.url } }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return { success: false, error: 'Failed to create checkout session' }
  }
}

/**
 * Create Stripe customer portal session for subscription management
 */
export async function createPortalSession(
  userId: string
): Promise<ActionResponse<{ url: string }>> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.stripeCustomer) {
      return { success: false, error: 'No customer found' }
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomer,
      return_url: `${APP_URL}/dashboard/billing`,
    })

    return { success: true, data: { url: session.url } }
  } catch (error) {
    console.error('Error creating portal session:', error)
    return { success: false, error: 'Failed to create portal session' }
  }
}
