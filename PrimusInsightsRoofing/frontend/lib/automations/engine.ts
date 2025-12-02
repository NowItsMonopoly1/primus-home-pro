// PRIMUS HOME PRO - Automation Engine
// Triggers automated workflows based on lead events
// Includes Solar Site Suitability integration and Project Milestones

import { prisma } from '@/lib/db/prisma'
import { sendLeadReply } from '@/lib/actions/ai'
import { enrichLeadWithSolarData, isSolarApiConfigured, getSolarPotentialSummary } from '@/lib/solar/solar-api-service'
import type { AIChannel } from '@/types'

interface AutomationContext {
  leadId: string
  trigger: string
  data?: {
    address?: string
    siteSuitability?: string
    maxPanelsCount?: number
    systemSizeKW?: number
    // Project/Milestone data
    projectId?: string
    milestoneName?: string
    milestoneCategory?: string
    projectStage?: string
  }
}

// Supported automation trigger types
export const AUTOMATION_TRIGGERS = [
  // Lead triggers
  'lead.created',
  'lead.updated',
  'lead.stage_changed',
  // Solar triggers
  'solar.analyzed',
  'solar.viable',
  'solar.challenging',
  // Proposal triggers
  'proposal.generated',
  'proposal.viewed',
  'proposal.accepted',
  // Project triggers
  'project.created',
  'project.stage_changed',
  // Milestone triggers
  'milestone.permit_submitted',
  'milestone.permit_approved',
  'milestone.installation_scheduled',
  'milestone.installation_complete',
  'milestone.inspection_passed',
  'milestone.pto_received',
] as const

export type AutomationTrigger = typeof AUTOMATION_TRIGGERS[number]

interface AutomationConfig {
  channel?: AIChannel
  delay?: number // seconds
  conditions?: {
    minScore?: number
    maxScore?: number
    intentIn?: string[]
    stageIn?: string[]
    siteSuitabilityIn?: ('VIABLE' | 'CHALLENGING' | 'NOT_VIABLE')[]
    solarEnriched?: boolean
    projectStageIn?: string[]
    milestoneCategoryIn?: string[]
  }
  actions?: {
    enrichSolar?: boolean  // Trigger solar enrichment
    notifyOnViable?: boolean  // Send notification for viable sites
    sendCustomerUpdate?: boolean  // Send update to customer
    createTask?: boolean  // Create internal task
  }
}

/**
 * Run automations for a given lead and trigger
 * Called after lead creation, updates, or by cron
 */
export async function runAutomations(ctx: AutomationContext): Promise<void> {
  console.log(`[AUTO] Running automations for trigger: ${ctx.trigger}`)

  try {
    // 1. Fetch lead with recent events
    const lead = await prisma.lead.findUnique({
      where: { id: ctx.leadId },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    if (!lead) {
      console.log(`[AUTO] Lead not found: ${ctx.leadId}`)
      return
    }

    // 2. Fetch matching automations
    const automations = await prisma.automation.findMany({
      where: {
        userId: lead.userId,
        trigger: ctx.trigger,
        enabled: true,
      },
    })

    if (automations.length === 0) {
      console.log(`[AUTO] No automations found for trigger: ${ctx.trigger}`)
      return
    }

    console.log(`[AUTO] Found ${automations.length} automation(s)`)

    // 3. Get AI analysis from latest event
    const analysisEvent = lead.events.find((e) => {
      const metadata = e.metadata as any
      return metadata?.intent || metadata?.score
    })

    const metadata = analysisEvent?.metadata as any
    const analysis = metadata
      ? {
          intent: metadata.intent ?? lead.intent ?? 'Info',
          score: metadata.score ?? lead.score ?? 50,
          sentiment: metadata.sentiment ?? lead.sentiment ?? 'Neutral',
        }
      : null

    // 4. Process each automation
    for (const automation of automations) {
      const config = (automation.config as AutomationConfig) || {}

      // Check conditions (including solar and project conditions)
      if (!checkConditions(lead, analysis, config.conditions, ctx)) {
        console.log(`[AUTO] Skipping "${automation.name}" - conditions not met`)
        continue
      }

      // Handle solar enrichment action if configured
      if (config.actions?.enrichSolar && lead.address && !lead.solarEnriched && isSolarApiConfigured()) {
        console.log(`[AUTO] Triggering solar enrichment for lead ${lead.id}`)
        const solarResult = await enrichLeadWithSolarData(lead.id, lead.address)
        
        if (solarResult.success) {
          console.log(`[AUTO] ✓ Solar enrichment complete: ${solarResult.siteSuitability}`)
          
          // Re-fetch lead to get updated data
          const updatedLead = await prisma.lead.findUnique({ where: { id: lead.id } })
          if (updatedLead) {
            Object.assign(lead, updatedLead)
          }

          // Trigger solar.analyzed automation
          await runAutomations({
            leadId: lead.id,
            trigger: 'solar.analyzed',
            data: {
              siteSuitability: solarResult.siteSuitability,
              maxPanelsCount: solarResult.maxPanelsCount,
              systemSizeKW: solarResult.systemSizeKW,
            },
          })
        }
      }

      // Get solar potential summary for templates
      const solarSummary = lead.solarEnriched && lead.siteSuitability && lead.maxPanelsCount
        ? getSolarPotentialSummary(
            lead.siteSuitability,
            lead.maxPanelsCount,
            (lead.maxPanelsCount * 400) / 1000 // Calculate kW from panels
          )
        : ''

      // Render template with solar variables
      const message = renderTemplate(automation.template, {
        name: lead.name || 'there',
        businessType: lead.source || 'services',
        agentName: 'Primus Team',
        solarSuitability: lead.siteSuitability || 'pending',
        maxPanels: String(lead.maxPanelsCount || 0),
        systemSize: lead.maxPanelsCount ? `${((lead.maxPanelsCount * 400) / 1000).toFixed(1)}kW` : 'N/A',
        solarSummary,
        annualProduction: lead.annualKwhProduction ? `${Math.round(lead.annualKwhProduction).toLocaleString()} kWh` : 'N/A',
      })

      // Determine channel
      const channel = config.channel || 'email'

      // Check if lead has contact info for channel
      if (channel === 'email' && !lead.email) {
        console.log(`[AUTO] Skipping "${automation.name}" - no email on file`)
        continue
      }

      if (channel === 'sms' && !lead.phone) {
        console.log(`[AUTO] Skipping "${automation.name}" - no phone on file`)
        continue
      }

      // Execute automation (with delay if specified)
      if (config.delay && config.delay > 0) {
        // TODO: Queue for background processing
        // For now, execute immediately
        console.log(`[AUTO] Delay ignored (background jobs not yet implemented)`)
      }

      // Send message
      console.log(`[AUTO] Executing "${automation.name}" for lead ${lead.id}`)

      const result = await sendLeadReply(lead.id, channel, message)

      if (result.success) {
        console.log(`[AUTO] ✓ Sent ${channel} via automation "${automation.name}"`)

        // Log automation execution
        await prisma.leadEvent.create({
          data: {
            leadId: lead.id,
            type: 'NOTE_ADDED',
            content: `Automation "${automation.name}" executed`,
            metadata: {
              automationId: automation.id,
              trigger: ctx.trigger,
              channel,
            } as any,
          },
        })
      } else {
        console.error(`[AUTO] ✗ Failed to send ${channel}:`, result.error)
      }
    }
  } catch (error) {
    console.error('[AUTO] Error running automations:', error)
  }
}

/**
 * Check if automation conditions are met
 */
function checkConditions(
  lead: any,
  analysis: { intent: string; score: number; sentiment: string } | null,
  conditions?: AutomationConfig['conditions'],
  ctx?: AutomationContext
): boolean {
  if (!conditions) return true

  // Score range check
  if (conditions.minScore !== undefined) {
    const score = analysis?.score ?? lead.score ?? 0
    if (score < conditions.minScore) return false
  }

  if (conditions.maxScore !== undefined) {
    const score = analysis?.score ?? lead.score ?? 0
    if (score > conditions.maxScore) return false
  }

  // Intent matching
  if (conditions.intentIn && conditions.intentIn.length > 0) {
    const intent = analysis?.intent ?? lead.intent
    if (!intent || !conditions.intentIn.includes(intent)) return false
  }

  // Stage matching
  if (conditions.stageIn && conditions.stageIn.length > 0) {
    if (!conditions.stageIn.includes(lead.stage)) return false
  }

  // Solar suitability matching
  if (conditions.siteSuitabilityIn && conditions.siteSuitabilityIn.length > 0) {
    if (!lead.siteSuitability || !conditions.siteSuitabilityIn.includes(lead.siteSuitability)) {
      return false
    }
  }

  // Solar enriched check
  if (conditions.solarEnriched !== undefined) {
    if (lead.solarEnriched !== conditions.solarEnriched) return false
  }

  // Project stage matching
  if (conditions.projectStageIn && conditions.projectStageIn.length > 0 && ctx?.data?.projectStage) {
    if (!conditions.projectStageIn.includes(ctx.data.projectStage)) return false
  }

  // Milestone category matching
  if (conditions.milestoneCategoryIn && conditions.milestoneCategoryIn.length > 0 && ctx?.data?.milestoneCategory) {
    if (!conditions.milestoneCategoryIn.includes(ctx.data.milestoneCategory)) return false
  }

  return true
}

/**
 * Render template with variables
 * Supports {{variable}} syntax
 */
function renderTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || '')
}
