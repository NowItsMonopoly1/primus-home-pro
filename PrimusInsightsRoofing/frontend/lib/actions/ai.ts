'use server'

// PRIMUS HOME PRO - AI Server Actions
// Triggers AI reply generation and sending

import { generateLeadReply } from '@/lib/ai/service'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import type { ActionResponse, AIReplyDraft, AIChannel, AITone } from '@/types'

/**
 * Generate AI draft reply for a lead
 * Returns draft for user review/edit
 */
export async function draftLeadReply(
  leadId: string,
  channel: AIChannel,
  tone?: AITone
): Promise<ActionResponse<AIReplyDraft>> {
  try {
    const draft = await generateLeadReply({ leadId, channel, tone })

    return {
      success: true,
      data: draft,
    }
  } catch (error) {
    console.error('AI Draft Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate draft',
    }
  }
}

/**
 * Send reply to lead
 * TODO: Integrate with Resend (email) and Twilio (SMS)
 */
export async function sendLeadReply(
  leadId: string,
  channel: AIChannel,
  body: string
): Promise<ActionResponse> {
  try {
    // TODO: Actual send logic with Resend/Twilio
    // For now, just log the event

    // if (channel === 'email') {
    //   await resend.emails.send({
    //     from: 'hello@primushomepro.com',
    //     to: lead.email,
    //     subject: 'Re: Your Inquiry',
    //     text: body,
    //   })
    // }

    // if (channel === 'sms') {
    //   await twilio.messages.create({
    //     from: process.env.TWILIO_PHONE_NUMBER,
    //     to: lead.phone,
    //     body,
    //   })
    // }

    // Log send event
    await prisma.leadEvent.create({
      data: {
        leadId,
        type: channel === 'email' ? 'EMAIL_SENT' : 'SMS_SENT',
        content: body,
        metadata: {
          channel,
          sentAt: new Date().toISOString(),
        } as any,
      },
    })

    // Update lead stage to Contacted
    await prisma.lead.update({
      where: { id: leadId },
      data: { stage: 'Contacted' },
    })

    revalidatePath('/dashboard/leads')

    return {
      success: true,
      data: null,
    }
  } catch (error) {
    console.error('Send Error:', error)
    return {
      success: false,
      error: 'Failed to send message',
    }
  }
}
