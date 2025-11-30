'use server'

// PRIMUS HOME PRO - Server Actions: Automation UI
// Manage automation settings from dashboard

import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import type { ActionResponse, AutomationConfig } from '@/types'

/**
 * Toggle automation enabled state
 */
export async function toggleAutomation(
  id: string,
  userId: string,
  enabled: boolean
): Promise<ActionResponse> {
  try {
    await prisma.automation.update({
      where: { id, userId },
      data: { enabled },
    })

    revalidatePath('/dashboard/automations')

    return {
      success: true,
      data: null,
    }
  } catch (error) {
    console.error('Error toggling automation:', error)
    return {
      success: false,
      error: 'Failed to toggle automation',
    }
  }
}

/**
 * Update automation configuration
 */
export async function updateAutomation(
  id: string,
  userId: string,
  data: {
    name: string
    template: string
    config: AutomationConfig
  }
): Promise<ActionResponse> {
  try {
    await prisma.automation.update({
      where: { id, userId },
      data: {
        name: data.name,
        template: data.template,
        config: data.config as any,
      },
    })

    revalidatePath('/dashboard/automations')

    return {
      success: true,
      data: null,
    }
  } catch (error) {
    console.error('Error updating automation:', error)
    return {
      success: false,
      error: 'Failed to update automation',
    }
  }
}
