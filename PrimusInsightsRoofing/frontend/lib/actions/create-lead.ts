// PRIMUS HOME PRO - Server Action: Create Lead
// Handles lead creation from landing page forms

'use server'

import { prisma } from '@/lib/db/prisma'
import { leadCaptureSchema } from '@/lib/validations/lead'
import { analyzeMessage } from '@/lib/ai/service'
import { runAutomations } from '@/lib/automations/engine'
import type { ActionResponse, Lead } from '@/types'
import { auth } from '@clerk/nextjs/server'

/**
 * Create a new lead from a landing page form submission
 * - Validates input
 * - AI analysis for intent/sentiment/score
 * - Creates lead + event records
 * - Returns success/error response
 */
export async function createLead(
  input: unknown
): Promise<ActionResponse<Lead>> {
  try {
    // Validate input
    const validatedData = leadCaptureSchema.parse(input)

    // For public forms, userId can be null or from a default "system" user
    // In production, you might want to create leads associated with the business owner
    // For now, we'll use the authenticated user if available, or create an orphan lead
    const { userId: clerkUserId } = await auth()

    let userId: string | null = null

    if (clerkUserId) {
      // Find user by Clerk ID
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
      })
      userId = user?.id || null
    }

    // If no authenticated user and no system user, we need to handle this
    // For MVP, we'll require at least one user in the database
    if (!userId) {
      // Try to find the first user (business owner) or create a system user
      const systemUser = await prisma.user.findFirst()

      if (!systemUser) {
        return {
          success: false,
          error: 'No user found. Please set up your account first.',
        }
      }

      userId = systemUser.id
    }

    // Prepare analysis context
    const analysisContext = {
      name: validatedData.name,
    }

    // Analyze the message or use a default
    const messageToAnalyze = validatedData.message ||
      `New lead: ${validatedData.name || 'Unknown'} - ${validatedData.email || validatedData.phone || 'No contact'}`

    const analysis = await analyzeMessage(messageToAnalyze, analysisContext)

    // Create lead in database
    const lead = await prisma.lead.create({
      data: {
        userId,
        name: validatedData.name || null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        source: validatedData.source,
        score: analysis.score,
        intent: analysis.intent,
        sentiment: analysis.sentiment,
        metadata: validatedData.metadata as any,
        events: {
          create: [
            {
              type: 'FORM_SUBMIT',
              content: validatedData.message || 'Lead captured from landing page',
              metadata: {
                source: validatedData.source,
                rawInput: validatedData,
              } as any,
            },
            {
              type: 'AI_ANALYSIS',
              content: analysis.summary,
              metadata: analysis as any,
            },
          ],
        },
      },
    })

    console.log('✓ Lead created:', lead.id, '| Score:', lead.score, '| Intent:', lead.intent)

    // Trigger automations asynchronously (don't block response)
    // Fire and forget - automations will run in background
    runAutomations({
      leadId: lead.id,
      trigger: 'lead.created',
    }).catch((error) => {
      console.error('Error running automations:', error)
    })

    return {
      success: true,
      data: lead,
    }
  } catch (error) {
    console.error('Error creating lead:', error)

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: 'Failed to create lead. Please try again.',
    }
  }
}
