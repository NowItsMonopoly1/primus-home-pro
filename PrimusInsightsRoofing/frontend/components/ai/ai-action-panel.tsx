'use client'

// PRIMUS HOME PRO - AI Action Panel
// Live AI reply generation interface

import { useState, useTransition } from 'react'
import { Sparkles, Send, RefreshCw, Mail, MessageSquare } from 'lucide-react'
import { draftLeadReply, sendLeadReply } from '@/lib/actions/ai'
import type { LeadWithMeta, AIChannel, AITone } from '@/types'

interface AIActionPanelProps {
  lead: LeadWithMeta
}

export function AIActionPanel({ lead }: AIActionPanelProps) {
  const [body, setBody] = useState('')
  const [channel, setChannel] = useState<AIChannel>('email')
  const [isPending, startTransition] = useTransition()

  const hasEmail = Boolean(lead.email)
  const hasPhone = Boolean(lead.phone)

  function handleDraft(tone: AITone = 'default') {
    startTransition(async () => {
      const result = await draftLeadReply(lead.id, channel, tone)

      if (result.success && result.data) {
        setBody(result.data.body)
      } else {
        const errorMessage = !result.success ? (result as any).error || 'Failed to generate draft' : 'Failed to generate draft'
        alert(errorMessage)
      }
    })
  }

  function handleSend() {
    if (!body.trim()) return

    const confirmed = confirm(
      `Send this ${channel} to ${lead.name || 'lead'}?\n\n"${body}"`
    )

    if (!confirmed) return

    startTransition(async () => {
      const result = await sendLeadReply(lead.id, channel, body)

      if (result.success) {
        setBody('')
        alert(`${channel === 'email' ? 'Email' : 'SMS'} sent successfully!`)
      } else {
        const errorMessage = !result.success ? (result as any).error || 'Failed to send message' : 'Failed to send message'
        alert(errorMessage)
      }
    })
  }

  // Determine if channel is usable
  const canUseEmail = hasEmail
  const canUseSMS = hasPhone

  return (
    <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
          <Sparkles className="h-3 w-3" /> AI Assistant
        </div>

        {/* Channel Toggle */}
        <div className="flex rounded-lg border border-border bg-background p-0.5">
          <button
            onClick={() => setChannel('email')}
            disabled={!canUseEmail}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] transition-all ${
              channel === 'email'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={!canUseEmail ? 'No email on file' : undefined}
          >
            <Mail className="h-3 w-3" />
            Email
          </button>
          <button
            onClick={() => setChannel('sms')}
            disabled={!canUseSMS}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] transition-all ${
              channel === 'sms'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={!canUseSMS ? 'No phone on file' : undefined}
          >
            <MessageSquare className="h-3 w-3" />
            SMS
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={
          isPending
            ? 'AI is writing...'
            : `Draft your ${channel} or click "Generate Draft"`
        }
        className="h-24 w-full resize-none rounded-lg border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
      />

      {/* Character count for SMS */}
      {channel === 'sms' && body && (
        <p className="text-right text-[10px] text-muted-foreground">
          {body.length} / 160 characters
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => handleDraft('default')}
          disabled={isPending || (!canUseEmail && !canUseSMS)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
          Generate Draft
        </button>

        <button
          onClick={handleSend}
          disabled={!body.trim() || isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3 w-3" />
          Send {channel === 'email' ? 'Email' : 'SMS'}
        </button>
      </div>

      {/* Warning for missing contact info */}
      {!canUseEmail && !canUseSMS && (
        <p className="text-center text-xs text-destructive">
          No email or phone on file for this lead
        </p>
      )}
    </div>
  )
}
