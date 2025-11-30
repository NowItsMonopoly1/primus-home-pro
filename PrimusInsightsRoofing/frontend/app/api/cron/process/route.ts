// PRIMUS HOME PRO - Cron Job: Process Stale Leads
// Triggers "no_reply_3d" automation for inactive leads

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { runAutomations } from '@/lib/automations/engine'

/**
 * Cron endpoint to process stale leads
 * Call this via Vercel Cron or external scheduler
 *
 * Example cron schedule (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/process",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  try {
    // Security: Verify cron secret (optional but recommended)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] Starting stale lead processing...')

    // Find leads inactive for > 3 days
    const cutoffDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago

    const staleLeads = await prisma.lead.findMany({
      where: {
        stage: {
          notIn: ['Closed', 'Lost'],
        },
        updatedAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
        name: true,
        updatedAt: true,
      },
    })

    console.log(`[CRON] Found ${staleLeads.length} stale lead(s)`)

    let processed = 0

    // Trigger automations for each stale lead
    for (const lead of staleLeads) {
      console.log(
        `[CRON] Processing stale lead: ${lead.name || 'Anonymous'} (last active: ${lead.updatedAt})`
      )

      await runAutomations({
        leadId: lead.id,
        trigger: 'lead.no_reply_3d',
      })

      processed++
    }

    return NextResponse.json({
      success: true,
      processed,
      total: staleLeads.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[CRON] Error processing stale leads:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
