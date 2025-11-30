// PRIMUS HOME PRO - Data Layer: Leads
// Server-side queries for CRM dashboard

import { prisma } from '@/lib/db/prisma'
import type { LeadWithMeta } from '@/types'

/**
 * Get all leads for a user with enriched metadata
 * Used by CRM dashboard
 */
export async function getLeadsForUser(userId: string): Promise<LeadWithMeta[]> {
  const leads = await prisma.lead.findMany({
    where: { userId },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return leads.map((lead) => {
    const lastEvent = lead.events[0]
    const meta = lastEvent?.metadata as any | undefined

    return {
      ...lead,
      lastEventAt: lastEvent?.createdAt ?? lead.createdAt,
      lastIntent: meta?.intent ?? lead.intent ?? 'New',
      lastScore: meta?.score ?? lead.score ?? 0,
      lastSentiment: meta?.sentiment ?? lead.sentiment ?? 'Neutral',
    }
  })
}

/**
 * Get a single lead with full event history
 */
export async function getLeadById(leadId: string): Promise<LeadWithMeta | null> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!lead) return null

  const lastEvent = lead.events[0]
  const meta = lastEvent?.metadata as any | undefined

  return {
    ...lead,
    lastEventAt: lastEvent?.createdAt ?? lead.createdAt,
    lastIntent: meta?.intent ?? lead.intent ?? 'New',
    lastScore: meta?.score ?? lead.score ?? 0,
    lastSentiment: meta?.sentiment ?? lead.sentiment ?? 'Neutral',
  }
}
