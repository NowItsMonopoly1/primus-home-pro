// PRIMUS HOME PRO - Type Definitions
// Centralized TypeScript types and interfaces

import { Lead, LeadEvent, User, Automation } from '@prisma/client'

// Re-export Prisma types
export type { Lead, LeadEvent, User, Automation }

// Extended types with relations
export type LeadWithEvents = Lead & {
  events: LeadEvent[]
}

export type LeadWithUser = Lead & {
  user: User
}

// AI Types
export type AIProvider = 'claude' | 'gemini'

export type AIIntent = 'Booking' | 'Info' | 'Pricing' | 'Support' | 'Spam'

export type AISentiment = 'Positive' | 'Neutral' | 'Negative'

export interface AIAnalysis {
  intent: AIIntent
  sentiment: AISentiment
  score: number // 0-100 lead quality score
  summary: string
  suggestedResponse?: string
}

// Lead Event Types
export type LeadEventType =
  | 'EMAIL_SENT'
  | 'EMAIL_RECEIVED'
  | 'SMS_SENT'
  | 'SMS_RECEIVED'
  | 'NOTE_ADDED'
  | 'STAGE_CHANGE'
  | 'AI_ANALYSIS'
  | 'AI_DRAFT'
  | 'FORM_SUBMIT'

// Lead Stages
export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Closed' | 'Lost'

// Automation Triggers
export type AutomationTrigger =
  | 'NEW_LEAD'
  | 'NO_REPLY_3D'
  | 'INTENT_BOOKING'
  | 'STAGE_CHANGE'

// Automation Actions
export type AutomationAction = 'SEND_EMAIL' | 'SEND_SMS' | 'AI_FOLLOWUP' | 'WEBHOOK'

// Server Action Return Types
export type ActionResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

// Lead Capture Form Types
export interface LeadCaptureInput {
  name?: string
  email?: string
  phone?: string
  source: string
  message?: string
  metadata?: Record<string, unknown>
}

// CRM Types
export interface LeadWithMeta extends Lead {
  lastEventAt: Date | null
  lastIntent: string | null
  lastScore: number | null
  lastSentiment: string | null
  events: LeadEvent[]
}

// AI Reply Types
export type AITone = 'default' | 'shorter' | 'formal' | 'casual'
export type AIChannel = 'email' | 'sms'

export interface AIReplyDraft {
  channel: AIChannel
  body: string
  tone: AITone
}

// Automation Config Types
export interface AutomationConditions {
  minScore?: number
  maxScore?: number
  intentIn?: AIIntent[]
  stageIn?: LeadStage[]
}

export interface AutomationConfig {
  channel?: AIChannel
  delayMinutes?: number
  conditions?: AutomationConditions
}

export interface AutomationWithConfig extends Omit<Automation, 'config'> {
  config: AutomationConfig
}
