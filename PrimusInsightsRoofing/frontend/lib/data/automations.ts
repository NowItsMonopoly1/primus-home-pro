// PRIMUS HOME PRO - Data Layer: Automations
// Server-side queries for automation management

import { prisma } from '@/lib/db/prisma'
import type { AutomationWithConfig } from '@/types'

/**
 * Get all automations for a user with typed config
 */
export async function getAutomationsForUser(
  userId: string
): Promise<AutomationWithConfig[]> {
  const automations = await prisma.automation.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })

  return automations.map((automation) => ({
    ...automation,
    config: (automation.config as any) || {},
  })) as AutomationWithConfig[]
}

/**
 * Get single automation by ID
 */
export async function getAutomationById(
  id: string,
  userId: string
): Promise<AutomationWithConfig | null> {
  const automation = await prisma.automation.findUnique({
    where: { id, userId },
  })

  if (!automation) return null

  return {
    ...automation,
    config: (automation.config as any) || {},
  } as AutomationWithConfig
}
