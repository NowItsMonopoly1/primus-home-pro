'use server'

// PRIMUS HOME PRO - Server Actions: CRM
// Handles stage changes and internal notes

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import type { ActionResponse } from '@/types'

/**
 * Update lead stage
 * Creates a STAGE_CHANGE event for audit trail
 */
export async function updateLeadStage(
  leadId: string,
  stage: string
): Promise<ActionResponse> {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { stage },
    })

    await prisma.leadEvent.create({
      data: {
        leadId,
        type: 'STAGE_CHANGE',
        content: `Stage changed to ${stage}`,
        metadata: {
          newStage: stage,
          timestamp: new Date().toISOString(),
        } as any,
      },
    })

    revalidatePath('/dashboard/leads')
    return { success: true, data: null }
  } catch (error) {
    console.error('Error updating lead stage:', error)
    return { success: false, error: 'Failed to update stage' }
  }
}

/**
 * Add internal note to lead
 * Creates a NOTE_ADDED event
 */
export async function addLeadNote(formData: FormData): Promise<ActionResponse> {
  const leadId = formData.get('leadId') as string
  const content = formData.get('note') as string

  if (!leadId || !content) {
    return { success: false, error: 'Missing required fields' }
  }

  try {
    await prisma.leadEvent.create({
      data: {
        leadId,
        type: 'NOTE_ADDED',
        content,
      },
    })

    revalidatePath('/dashboard/leads')
    return { success: true, data: null }
  } catch (error) {
    console.error('Error adding note:', error)
    return { success: false, error: 'Failed to add note' }
  }
}
