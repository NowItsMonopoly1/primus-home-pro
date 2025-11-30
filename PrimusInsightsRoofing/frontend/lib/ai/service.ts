// PRIMUS HOME PRO - AI Service Layer
// Abstracted AI client for easy provider switching (Claude ↔ Gemini)

import Anthropic from '@anthropic-ai/sdk'
import { anthropic as anthropicAI } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import type { AIProvider, AIAnalysis, AIReplyDraft, AIChannel, AITone } from '@/types'
import { prisma } from '@/lib/db/prisma'

// AI Provider configuration
const AI_PROVIDER: AIProvider = (process.env.AI_PROVIDER as AIProvider) || 'claude'

// Initialize Claude SDK client (for analyzeMessage)
const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Model configuration
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022'

/**
 * Analyze incoming message from a lead
 * Determines intent, sentiment, and lead quality score
 */
export async function analyzeMessage(
  message: string,
  context?: { name?: string; history?: string }
): Promise<AIAnalysis> {
  if (AI_PROVIDER === 'claude') {
    return analyzeWithClaude(message, context)
  }

  // Future: Add Gemini support
  // if (AI_PROVIDER === 'gemini') {
  //   return analyzeWithGemini(message, context)
  // }

  throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`)
}

/**
 * Generate a contextual response to a lead
 */
export async function generateResponse(
  message: string,
  context: {
    leadName?: string
    intent?: string
    history?: string
    tone?: 'professional' | 'friendly' | 'casual'
  }
): Promise<string> {
  if (AI_PROVIDER === 'claude') {
    return generateWithClaude(message, context)
  }

  throw new Error(`Unsupported AI provider: ${AI_PROVIDER}`)
}

// ============================================================================
// CLAUDE IMPLEMENTATION
// ============================================================================

async function analyzeWithClaude(
  message: string,
  context?: { name?: string; history?: string }
): Promise<AIAnalysis> {
  const systemPrompt = `You are an AI assistant for Primus Home Pro, a home services company specializing in roofing and solar.

Your task: Analyze incoming messages from potential leads and provide structured analysis.

OUTPUT FORMAT (valid JSON only):
{
  "intent": "Booking" | "Info" | "Pricing" | "Support" | "Spam",
  "sentiment": "Positive" | "Neutral" | "Negative",
  "score": <number 0-100>,
  "summary": "<brief 1-sentence summary>",
  "suggestedResponse": "<optional suggested response>"
}

SCORING GUIDE:
- 80-100: High intent, ready to book, urgent need
- 60-79: Interested, needs more info, warm lead
- 40-59: Browsing, low urgency, needs nurturing
- 20-39: Vague interest, unclear intent
- 0-19: Spam, irrelevant, or hostile

${context?.name ? `Lead name: ${context.name}` : ''}
${context?.history ? `\nPrevious context:\n${context.history}` : ''}`

  try {
    const response = await anthropicClient.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Analyze this message:\n\n"${message}"`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    const analysis = JSON.parse(content.text) as AIAnalysis
    return analysis
  } catch (error) {
    console.error('Error analyzing with Claude:', error)
    // Fallback analysis
    return {
      intent: 'Info',
      sentiment: 'Neutral',
      score: 50,
      summary: 'Unable to analyze message automatically',
    }
  }
}

async function generateWithClaude(
  message: string,
  context: {
    leadName?: string
    intent?: string
    history?: string
    tone?: 'professional' | 'friendly' | 'casual'
  }
): Promise<string> {
  const tone = context.tone || 'professional'

  const systemPrompt = `You are a helpful assistant for Primus Home Pro, a home services company specializing in roofing and solar installation.

TONE: ${tone}
${context.leadName ? `Lead's name: ${context.leadName}` : ''}
${context.intent ? `Detected intent: ${context.intent}` : ''}

GUIDELINES:
- Keep responses concise (2-3 sentences max)
- Always be helpful and professional
- If they want a quote, ask for their address
- If they want to book, offer a calendar link (mention "booking link")
- Never make promises about pricing without seeing the property
- Focus on value: quality work, licensed professionals, warranties

${context.history ? `\nConversation history:\n${context.history}` : ''}`

  try {
    const response = await anthropicClient.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a response to this message:\n\n"${message}"`,
        },
      ],
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    return content.text.trim()
  } catch (error) {
    console.error('Error generating response with Claude:', error)
    return `Thank you for your message${context.leadName ? `, ${context.leadName}` : ''}. A member of our team will get back to you shortly!`
  }
}

// ============================================================================
// AI REPLY GENERATION
// ============================================================================

/**
 * Generate AI reply draft for a lead
 * Uses lead history and context to create personalized responses
 */
export async function generateLeadReply(params: {
  leadId: string
  channel: AIChannel
  tone?: AITone
}): Promise<AIReplyDraft> {
  const { leadId, channel, tone = 'default' } = params

  // Fetch lead with events
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!lead) {
    throw new Error('Lead not found')
  }

  // Extract AI analysis from events
  const analysisEvent = lead.events.find((e) => {
    const metadata = e.metadata as any
    return metadata?.intent || metadata?.score
  })

  const metadata = analysisEvent?.metadata as any
  const intent = metadata?.intent ?? lead.intent ?? 'Info'
  const score = metadata?.score ?? lead.score ?? 50

  // Build context from recent events
  const recentHistory = lead.events
    .slice(0, 3)
    .map((e) => `${e.type}: ${e.content}`)
    .join('\n')

  // Construct prompt
  const prompt = `You are the AI assistant for Primus Home Pro, a home services company.

CONTEXT:
Lead Name: ${lead.name || 'Customer'}
Lead Intent: ${intent} (Score: ${score}/100)
Channel: ${channel.toUpperCase()}
Recent Activity:
${recentHistory}

TASK:
Write a ${channel === 'sms' ? 'text message' : 'email'} reply to this lead.

TONE: ${tone === 'shorter' ? 'Very brief and direct' : tone === 'formal' ? 'Professional and formal' : tone === 'casual' ? 'Friendly and conversational' : 'Warm but professional'}

RULES:
- ${channel === 'sms' ? 'Keep under 160 characters' : 'Keep to 2-3 sentences max'}
- Be helpful and human
- If they're interested (score >60), suggest next steps
- If they're browsing (score 40-60), offer more info
- Ask ONE clarifying question to move forward
- Do NOT mention AI or automation
- Sign off as "The Primus Team"

Write the ${channel} now:`

  try {
    const { text } = await generateText({
      model: anthropicAI('claude-3-5-sonnet-20241022'),
      prompt,
      temperature: 0.7,
    })

    const draft: AIReplyDraft = {
      channel,
      body: text.trim(),
      tone,
    }

    // Log AI draft event
    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        type: 'AI_DRAFT',
        content: `AI generated ${channel} draft`,
        metadata: draft as any,
      },
    })

    return draft
  } catch (error) {
    console.error('Error generating lead reply:', error)
    throw new Error('Failed to generate reply')
  }
}

// ============================================================================
// FUTURE: GEMINI IMPLEMENTATION
// ============================================================================

// async function analyzeWithGemini(message: string, context?: any): Promise<AIAnalysis> {
//   // TODO: Implement Gemini analysis
//   throw new Error('Gemini support not yet implemented')
// }
